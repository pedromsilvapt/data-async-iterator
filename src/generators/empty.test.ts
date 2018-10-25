import test from 'blue-tape';
import { empty } from './empty';

test( 'concat', async t => {
    const iterable = empty();

    const iterator = iterable[ Symbol.asyncIterator ]();

    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );