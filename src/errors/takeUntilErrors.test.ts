import test from 'blue-tape';
import { takeUntilErrors } from './takeUntilErrors';
import { throwIf } from './throwIf';

test( '#takeUntilErrors', t => {
    t.test( 'terminate on first error', async t => {
        const iterable = takeUntilErrors(
            throwIf( [ 1, new Error( 'takeUntilErrors' ), 2 ] )
        );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        await t.shouldFail( iterator.next(), 'takeUntilErrors' );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'iterator with too few errors', async t => {
        const iterable = takeUntilErrors(
            throwIf( [ 1, new Error( 'takeUntilErrors' ), new Error( 'takeUntilErrors' ), 2 ] ),
            3
        );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        await t.shouldFail( iterator.next(), 'takeUntilErrors' );
        await t.shouldFail( iterator.next(), 'takeUntilErrors' );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'iterator with more errors than required', async t => {
        const iterable = takeUntilErrors(
            throwIf( [ 1, new Error( 'takeUntilErrors' ), 2, new Error( 'takeUntilErrors' ), new Error( 'takeUntilErrors' ), 3 ] ),
            2
        );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        await t.shouldFail( iterator.next(), 'takeUntilErrors' );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        await t.shouldFail( iterator.next(), 'takeUntilErrors' );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'iterator with contiguous errors', async t => {
        const iterable = takeUntilErrors(
            throwIf( [ 1, new Error( 'takeUntilErrors' ), 2, new Error( 'takeUntilErrors' ), new Error( 'takeUntilErrors' ), 3 ] ),
            2, true
        );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        await t.shouldFail( iterator.next(), 'takeUntilErrors' );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        await t.shouldFail( iterator.next(), 'takeUntilErrors' );
        await t.shouldFail( iterator.next(), 'takeUntilErrors' );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );
