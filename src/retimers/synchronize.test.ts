import test from 'blue-tape';
import { synchronize } from './synchronize';
import { delay } from './delay';
import { toArray } from '../reducers/toArray';
import { merge } from '../combinators/merge';

test( '#synchronize', t => {
    t.test( 'synchronize iterables without any lag', async t => {
        const iterables = synchronize<number>( [ delay( [ 0, 1, 2 ], 20 ), delay( [ 3, 4, 5 ], 60 ) ], 0 );
    
        const iterators = iterables.map( iterable => iterable[ Symbol.asyncIterator ]() );
    
        t.deepLooseEqual( await toArray( merge( iterators ) ), [ 0, 3, 1, 4, 2, 5 ] );
    } );
    
    
    t.test( 'synchronize iterables with some lag', async t => {
        const iterables = synchronize<number>( [ delay( [ 0, 1, 2, 3 ], 20 ), delay( [ 4, 5, 6, 7 ], 100 ) ], 2 );
    
        const iterators = iterables.map( iterable => iterable[ Symbol.asyncIterator ]() );
    
        t.deepLooseEqual( await toArray( merge( iterators ) ), [ 0, 1, 2, 4, 3, 5, 6, 7 ] );
    } );
    
    t.test( 'finished synchronized iterators should return right away', async t => {
        const iterables = synchronize<number>( [ delay( [ 0, 1, 2, 3 ], 20 ), delay( [ 4, 5, 6, 7 ], 100 ) ], 2 );
    
        const iterators = iterables.map( iterable => iterable[ Symbol.asyncIterator ]() );
    
        t.deepLooseEqual( await toArray( merge( iterators ) ), [ 0, 1, 2, 4, 3, 5, 6, 7 ] );
        t.deepLooseEqual( await toArray( merge( iterators ) ), [] );
    } );
    
    t.test( 'synchronized iterables should be able to be iterated multiple times', async t => {
        const iterables = synchronize<number>( [ delay( [ 0, 1, 2, 3 ], 20 ), delay( [ 4, 5, 6, 7 ], 100 ) ], 2 );
    
        const iterators = iterables.map( iterable => iterable[ Symbol.asyncIterator ]() );
        const iterators2 = iterables.map( iterable => iterable[ Symbol.asyncIterator ]() );
    
        t.deepLooseEqual( await toArray( merge( iterators ) ), [ 0, 1, 2, 4, 3, 5, 6, 7 ] );
        t.deepLooseEqual( await toArray( merge( iterators2 ) ), [ 0, 1, 2, 4, 3, 5, 6, 7 ] );
    } );
    
    
    t.test( 'synchronized iterables should be released after the other ends', async t => {
        const iterables = synchronize<number>( [ delay( [ 0, 1, 2, 3 ], 20 ), delay( [ 4, 5 ], 100 ) ], 0 );
    
        const iterators = iterables.map( iterable => iterable[ Symbol.asyncIterator ]() );
        const iterators2 = iterables.map( iterable => iterable[ Symbol.asyncIterator ]() );
    
        t.deepLooseEqual( await toArray( merge( iterators ) ), [ 0, 4, 1, 5, 2, 3 ] );
        t.deepLooseEqual( await toArray( merge( iterators2 ) ), [ 0, 4, 1, 5, 2, 3 ] );
    } );    
} );
