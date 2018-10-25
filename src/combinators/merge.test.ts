import test from 'blue-tape';
import { merge } from './merge';
import { delay } from '../retimers/delay';
import { map } from '../transformers/map';

test( 'merge', async t => {
    const iterable = merge( [ 
        delay( [ 1, 3, 5 ], 100 ) ,
        delay( [ 2, 4, 6 ], 210 )
    ] );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'merge should propagate errors', async t => {
    const iterable = merge( [ 
        delay( [ 1, 3, 5 ], 100 ),
        delay( map( [ 2, 4, 6 ], n => Promise.reject( new Error( `Even number.` ) ) ), 210 )
    ] );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.shouldFail( iterator.next(), 'Even number.' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.shouldFail( iterator.next(), 'Even number.' );
    t.shouldFail( iterator.next(), 'Even number.' );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );