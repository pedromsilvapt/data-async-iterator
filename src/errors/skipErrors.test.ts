import test from 'blue-tape';
import { skipErrors } from './skipErrors';
import { throwIf } from './throwIf';


test( 'throw results when boolean', async t => {
    const iterable = skipErrors( throwIf( [ 1, new Error( 'skipErrors' ), 2 ] ) );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );