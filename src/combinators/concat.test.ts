import test from 'blue-tape';
import { delay } from '../retimers/delay';
import { concat } from './concat';

test( 'concat', async t => {
    const iterable = concat( [ 
        delay( [ 1, 3, 5 ], 20 ),
        delay( [ 2, 4, 6 ], 10 )
    ] );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );