import test from 'blue-tape';
import { slice } from './slice';
import { throwIf } from '../errors/throwIf';

test( 'slice a finite amount', async t => {
    const iterable = slice( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 2, 6 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );


test( 'slice without end', async t => {
    const iterable = slice( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 2 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 7 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'slice with a negative start', async t => {
    const iterable = slice( [ 0, 1, 2, 3, 4, 5, 6, 7 ], -4 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 7 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'slice with a negative start and end', async t => {
    const iterable = slice( [ 0, 1, 2, 3, 4, 5, 6, 7 ], -4, -2 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'slice with a positive start and negative end', async t => {
    const iterable = slice( [ 0, 1, 2, 3, 4, 5, 6, 7 ], 2, -2 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'slice should propagate errors and carry on', async t => {
    const iterable = slice( throwIf( [ 0, new Error( 'Slice error.' ), 1, 2, 3, new Error( 'Slice error.' ), 4, 5, 6, 7 ] ), 2, -2 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.shouldFail( iterator.next(), 'Slice error.' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.shouldFail( iterator.next(), 'Slice error.' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'slice end=0 should be empty', async t => {
    const iterable = slice( throwIf( [ 0, new Error( 'Slice error.' ), 1, 2, 3, new Error( 'Slice error.' ), 4, 5, 6, 7 ] ), -2, 0 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'slice start negative and end positive', async t => {
    const iterable = slice( throwIf( [ 0, new Error( 'Slice error.' ), 1, 2 ] ), -2, 2 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.shouldFail( iterator.next(), 'Slice error.' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );
