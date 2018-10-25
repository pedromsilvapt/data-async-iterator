import test from 'blue-tape';
import { throwIf } from './throwIf';

test( 'throw results when boolean', async t => {
    const iterable = throwIf( [ 1, new Error( 'throwIf' ), 2 ] );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    await t.shouldFail( iterator.next(), 'throwIf' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
} );

test( 'throw custom errors', async t => {
    const iterable = throwIf( [ 1, "1.5", 2 ], item => typeof item === 'string' ? new Error( 'throwIf' ) : null );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    await t.shouldFail( iterator.next(), 'throwIf' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );
