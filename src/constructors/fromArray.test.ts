import test from 'blue-tape';
import { fromArray } from './fromArray';

test( '#fromArray', async t => {
    const iterable = fromArray( Promise.resolve( [ 1, 2, 3 ] ) );

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );