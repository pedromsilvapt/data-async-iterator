import { reduce } from "./reduce";
import { AsyncIterableLike } from "../core";
import { inject } from "./inject";

export function sum ( iterable : AsyncIterableLike<number> ) : Promise<number> {
    return reduce<number, number>( iterable, ( memo, item ) => memo + item, 0 );
}

export function product ( iterable : AsyncIterableLike<number> ) : Promise<number> {
    return reduce<number, number>( iterable, ( memo, item ) => memo * item, 1 );
}

export function mean ( iterable : AsyncIterableLike<number> ) : Promise<number> {
    return inject( iterable, ( memo, item ) => {
        memo.sum += item;
        memo.count += 1;
    }, { sum: 0, count: 0 } ).then( m => {
        if ( m.count == 0 ) {
            return 0;
        } else {
            return m.sum / m.count;
        }
    } );
}

export function bounds ( iterable : AsyncIterableLike<number> ) : Promise<[number, number]> {
    return inject( iterable, ( memo, item ) => {
        if ( memo.first || memo.min > item ) {
            memo.min = item;

            memo.first = false;            
        }

        if ( memo.first || memo.max < item ) {
            memo.max = item;

            memo.first = false;
        }
    }, { min: 0, max: 0, first: true } ).then<[number, number]>( m => [ m.min, m.max ] );
}

export function min ( iterable : AsyncIterableLike<number> ) : Promise<number> {
    return bounds( iterable ).then( m => m[ 0 ] );
}

export function max ( iterable : AsyncIterableLike<number> ) : Promise<number> {
    return bounds( iterable ).then( m => m[ 1 ] );
}