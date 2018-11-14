import test from 'blue-tape';
import { throwIf } from './throwIf';
import { skipValues } from './skipValues';

test( 'throw results when boolean', async t => {
    const iterable = skipValues( throwIf( [ 1, new Error( 'skipValues' ), 2 ] ) );

    const iterator = iterable[ Symbol.asyncIterator ]();

    await t.shouldFail( iterator.next(), 'skipValues' );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );
