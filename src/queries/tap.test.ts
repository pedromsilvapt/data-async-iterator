import test from 'blue-tape';
import { toAsyncIterator } from '../core';
import { tap } from './tap';

test( '#tap', t => {
    t.test( 'tap every element', async t => {
        let value : number[] = [];
        let index : number[] = [];

        const iterator = toAsyncIterator( tap( [ 1, 2, 3 ], ( v, i ) => {
            value.push( v );
            index.push( i );
        } ) );

        t.deepEqual( value, [] );
        t.deepEqual( index, [] );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepEqual( value, [ 1 ] );
        t.deepEqual( index, [ 0 ] );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepEqual( value, [ 1, 2 ] );
        t.deepEqual( index, [ 0, 1 ] );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepEqual( value, [ 1, 2, 3 ] );
        t.deepEqual( index, [ 0, 1, 2 ] );

        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
        t.deepEqual( value, [ 1, 2, 3 ] );
        t.deepEqual( index, [ 0, 1, 2 ] );
    } );
} )