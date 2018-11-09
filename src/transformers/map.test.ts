import test from 'blue-tape';
import { map } from './map';

test( '#map', t => {
    t.test( 'map test', async t => {
        const iterable = map( [ 1, 2, 3 ], n => n * 2 );
    
        const iterator = iterable[ Symbol.asyncIterator ]();
    
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
    
    t.test( 'map should propagate errors', async t => {
        const iterable = map( [ 1, 2, 3 ], n => {
            if ( n % 2 == 0 ) return Promise.reject( new Error( `Even number.` ) );
    
            return n * 2;
        } );
    
        const iterator = iterable[ Symbol.asyncIterator ]();
    
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        await t.shouldFail( iterator.next(), 'Even number.' );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 6 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );