import test from 'blue-tape';
import { filter } from './filter';

test( 'filter test', async t => {
    const iterable = filter( [ 1, 2, 3 ], n => n % 2 == 1 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'filter should propagate errors', async t => {
    const iterable = filter( [ 1, 2, 3 ], n => {
        if ( n % 2 == 0 ) return Promise.reject( new Error( `Even number.` ) );

        return n % 2 == 1;
    } );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    await t.shouldFail( iterator.next(), 'Even number.' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );