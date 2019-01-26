import test from 'blue-tape';
import { dynamic } from './dynamic';

test( '#dynamic', t => {
    t.test( 'throw exception', async t => {
        const iterable = dynamic( () => Promise.reject( new Error( 'dynamic' ) ) );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.shouldFail( iterator.next(), 'dynamic' );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );