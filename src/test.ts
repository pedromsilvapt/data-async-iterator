( Symbol as any ).asyncIterator = Symbol( 'asyncIterator' );

import fs from 'fs';
import { delay } from "./retimers/delay";
import { repeat } from "./generators/repeat";
import { forEach } from "./reducers/forEach";
import { range } from "./generators/range";
import { slice } from "./slicers/slice";
import { emits } from "./generators/emits";
import { buffered } from "./transformers/buffered";
import { dup } from "./shared";
import { synchronize } from "./retimers/synchronize";
import { merge } from "./combinators/merge";
import { map } from "./transformers/map";
import { zip } from "./combinators/zip";
import { take } from "./slicers/take";
import { flatMapConcurrent } from "./combinators/flatMap";
import { log } from "./transformers/observe";
import { drain } from "./reducers/drain";
import { fromStream } from "./constructors/fromStream";
import { debounce } from './retimers/debounce';
import { throttle } from './retimers/throttle';

// forEach( slice( delay( range( 0 ), 100 ), 0, 10 ), v => console.log( v ) );

const emmiter = emits<number>();

emmiter.value( 1 );
emmiter.value( 2 );

// forEach( delay( emmiter, 300 ), v => console.log( v ) ).catch( err => console.error( err.message, err.stack ) );

emmiter.end();

// const [ r1, r2 ] = synchronize( dup( range( 0 ) ), 4 );
const [ r1, r2 ] = dup( range( 0 ) );

const s1 = map( slice( delay( r1, 1000 ), 0, 3 ), n => '1 ' + n );

const s2 = map( slice( delay( r2, 3000 ), 0, 10 ), n => '2 ' + n );

let count = 0;

const work = async ( input : number ) => {
    await new Promise<void>( resolve => setTimeout( resolve, Math.random() * 3000 + 1000 ) );

    count--;

    return ( '' + input ).split( '' );
};

// forEach( parallel( take( r2, 20 ), work, 3 ), v => console.log( v ) );

// drain( log( flatMapConcurrent( [ 100, 400, 3000, 200 ], (d, i) => map( delay( range( 0, 20 ), d ), n => [ i, n ] ), 2 ) ) );

// drain( log( fromStream<Buffer>( fs.createReadStream( "src/retimers/synchronize.ts" ), 200 ) ) );

drain( log( throttle( delay( range( 0, 30 ), 300 ), 0 ) ) );
