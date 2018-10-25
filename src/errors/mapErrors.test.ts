import test from 'blue-tape';
import { mapErrors } from './mapErrors';
import { throwIf } from './throwIf';

test( 'mapErrors into values', async t => {
    const iterable = mapErrors( throwIf( [ 1, new Error( 'mapErrors' ), 2 ] ), err => err.message );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 'mapErrors' } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'mapErrors remaining as errors', async t => {
    const iterable = mapErrors( throwIf( [ 1, new Error( 'mapErrors' ), 2 ] ), err => new Error( err.message + err.message ), true );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    await t.shouldFail( iterator.next(), 'mapErrorsmapErrors' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );