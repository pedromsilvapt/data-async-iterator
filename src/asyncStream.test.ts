import test from 'blue-tape';
import { AsyncStream } from './asyncStream';

test( '#dynamic and flatten', t => {
    t.test( 'throw exception', async t => {
        const iterable = AsyncStream.dynamic( async () => {
            throw new Error( 'dynamic' );
        } ).flatten();

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.shouldFail( iterator.next(), 'dynamic' );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );