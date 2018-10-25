import test from 'blue-tape';
import { count } from './count';

test( '#count', t => {
    t.test( 'empty iterable', async t => {
        t.equal( await count( [] ), 0 );
    } );

    t.test( 'iterable with items', async t => {
        t.equal( await count( [ 1, 2, 3 ] ), 3 );
    } );
} );