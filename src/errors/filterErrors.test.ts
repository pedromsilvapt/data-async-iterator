import test from 'blue-tape';
import { filterErrors } from './filterErrors';
import { throwIf } from './throwIf';

test( 'filterErrors', async t => {
    const iterable = filterErrors( 
        throwIf( [ 1, new Error( 'filterErrors' ), new Error( 'otherError' ), 2 ] ), 
        err => err.message == 'filterErrors'
    );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    await t.shouldFail( iterator.next(), 'filterErrors' );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );
