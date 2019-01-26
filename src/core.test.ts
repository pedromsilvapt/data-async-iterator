import test from 'blue-tape';
import { fromPromise } from './core';

test( '#fromPromise', t => {
    t.test( 'throw exception', async t => {
        const iterable = fromPromise( Promise.reject( new Error( 'fromPromise' ) ) );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.shouldFail( iterator.next(), 'fromPromise' );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );