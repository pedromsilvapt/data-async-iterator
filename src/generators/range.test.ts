import test from 'blue-tape';
import { range } from './range';

test( 'range crescent', async t => {
    const iterable = range( 1, 3 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    await t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
    await t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
    await t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'range crescent empty', async t => {
    const iterable = range( 3, 3 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    await t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );

test( 'range crescent negative', async t => {
    const iterable = range( 4, 3 );

    const iterator = iterable[ Symbol.asyncIterator ]();

    await t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
    await t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );