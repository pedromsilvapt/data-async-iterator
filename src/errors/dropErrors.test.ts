import test from 'blue-tape';
import { dropErrors } from './dropErrors';
import { throwIf } from './throwIf';


test( 'throw results when boolean', async t => {
    const iterable = dropErrors( throwIf( [ 1, new Error( 'dropErrors' ), 2 ] ) );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );