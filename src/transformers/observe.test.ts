import test from 'blue-tape';
import { observe } from './observe';
import { toAsyncIterator } from '../core';

test( '#observe', t => {
    t.test( 'log every item', async t => {
        const log : any[] = [];

        const iterator = toAsyncIterator( observe( [ 1, 2, 3 ], {
            onValue: ( v ) => log.push( v ),
            onEnd: () => log.push( null )
        } ) );

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );

        t.deepLooseEqual( log, [ 1, 2, 3, null ] );
    } );
} );