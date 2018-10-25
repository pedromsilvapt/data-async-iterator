import test from 'blue-tape';
import { takeErrors } from './takeErrors';
import { throwIf } from './throwIf';


test( 'throw only errors and ignore values', async t => {
    const iterable = takeErrors( throwIf( [ 1, new Error( 'takeErrors' ), 2 ] ) );

    const iterator = iterable[ Symbol.asyncIterator ]();

    await t.shouldFail( iterator.next(), 'takeErrors' );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );