import test from 'blue-tape';
import { throwIf } from './throwIf';
import { dropValues } from './dropValues';

test( 'throw results when boolean', async t => {
    const iterable = dropValues( throwIf( [ 1, new Error( 'dropValues' ), 2 ] ) );

    const iterator = iterable[ Symbol.asyncIterator ]();

    await t.shouldFail( iterator.next(), 'dropValues' );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );
