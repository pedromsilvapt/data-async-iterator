import test from 'blue-tape';
import { take, takeWhile, takeLast } from './take';
import { toAsyncIterator } from '../core';

test( '#take', async t => {
    t.test( 'take zero should yield none', async t => {
        const iterator = toAsyncIterator( take( [ 1, 2 ], 0 ) );

        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'take with higher count', async t => {
        const iterator = toAsyncIterator( take( [ 1, 2 ], 4 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'take with smaller count', async t => {
        const iterator = toAsyncIterator( take( [ 1, 2 ], 1 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );

test( '#takeWhile', t => {
    t.test( 'no matching elements', async t => {
        const iterator = toAsyncIterator( takeWhile( [ 1, 3, 5 ], n => n % 2 == 0 ) );

        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'no matching elements', async t => {
        const iterator = toAsyncIterator( takeWhile( [ 2, 4, 5, 6, 7 ], n => n % 2 == 0 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'no matching elements', async t => {
        const iterator = toAsyncIterator( takeWhile( [ 2, 4, 6 ], n => n % 2 == 0 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );

test( '#takeLast', t => {
    t.test( 'more elements than needed', async t => {
        const iterator = toAsyncIterator( takeLast( [ 1, 2, 3, 4 ], 2 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );        
    } );

    t.test( 'less elements than needed', async t => {
        const iterator = toAsyncIterator( takeLast( [ 1, 2, 3, 4 ], 6 ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );        
    } );
} );