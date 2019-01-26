import test from 'blue-tape';
import { flattenSorted, flatten } from './flatMap';
import { delay } from '../retimers/delay';
import { throwIf } from '../errors/throwIf';

test( '#flatten', t => {
    t.test( 'throw exception', async t => {
        const iterable = flatten( [ throwIf( [ 1, new Error( 'flatten' ), 2, 3 ] ) ] );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.shouldFail( iterator.next(), 'flatten' );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'throw exception in the beginning', async t => {
        const iterable = flatten( [ throwIf( [ new Error( 'flatten' ) ] ) ] );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.shouldFail( iterator.next(), 'flatten' );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );

test( '#flattenSorted', t => {
    t.test( 'sorted iterables', async t => {
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

    t.test( 'sorted iterables return early', async t => {
        const iterable = flattenSorted( [ 
            delay( [ 1, 3, 5 ], 100 ) ,
            delay( [ 2, 4, 6 ], 210 )
        ], ( a, b ) => a - b );
    
        const iterator = iterable[ Symbol.asyncIterator ]();
    
        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.return( 123 ), { done: true, value: 123 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );