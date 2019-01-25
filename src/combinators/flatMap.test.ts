import test from 'blue-tape';
import { flattenSorted } from './flatMap';
import { delay } from '../retimers/delay';

test( '#flattenSorted', async t => {
    test( 'sorted iterables', async t => {
        const iterable = flattenSorted( [ 
            delay( [ 1, 3, 5 ], 100 ) ,
            delay( [ 2, 4, 6 ], 210 )
        ], ( a, b ) => a - b );
    
        const iterator = iterable[ Symbol.asyncIterator ]();
    
        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );