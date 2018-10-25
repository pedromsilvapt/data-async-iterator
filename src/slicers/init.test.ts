import test from 'blue-tape';
import { init } from './init';

test( '#init', async t => {
    t.test( 'sequence with more than one element', async t => {
        const iterable = init( [ 1, 2, 3, 4 ] );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'sequence with one element', async t => {
        const iterable = init( [ 1 ] );

        const iterator = iterable[ Symbol.asyncIterator ]();
    
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'sequence with zero elements', async t => {
        const iterable = init( [] );

        const iterator = iterable[ Symbol.asyncIterator ]();
    
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );