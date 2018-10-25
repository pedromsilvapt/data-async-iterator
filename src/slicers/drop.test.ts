import test from 'blue-tape';
import { toAsyncIterator } from '../core';
import { drop, dropWhile, dropLast } from './drop';

test( '#drop', async t => {
    t.test( 'drop zero should yield all items', async t => {
        const iterator = toAsyncIterator( drop( [ 1, 2 ], 0 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'drop with higher count should yield no items', async t => {
        const iterator = toAsyncIterator( drop( [ 1, 2 ], 4 ) );

        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'drop with smaller count', async t => {
        const iterator = toAsyncIterator( drop( [ 1, 2 ], 1 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );

test( '#takeWhile', t => {
    t.test( 'no matching elements', async t => {
        const iterator = toAsyncIterator( dropWhile( [ 1, 3, 5 ], n => n % 2 == 0 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'mixed matching elements', async t => {
        const iterator = toAsyncIterator( dropWhile( [ 2, 4, 5, 6, 7 ], n => n % 2 == 0 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 5 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 7 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'only matching elements', async t => {
        const iterator = toAsyncIterator( dropWhile( [ 2, 4, 6 ], n => n % 2 == 0 ) );

        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );

test( '#dropLast', t => {
    t.test( 'more elements than needed', async t => {
        const iterator = toAsyncIterator( dropLast( [ 1, 2, 3, 4 ], 2 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'less elements than needed', async t => {
        const iterator = toAsyncIterator( dropLast( [ 1, 2, 3, 4 ], 6 ) );

        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );        
    } );
} );