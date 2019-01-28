import test from 'blue-tape';
import { paginate } from './paginate';

test( '#paginate', t => {
    t.test( 'end correctly', async t => {
        const iterable = paginate( p => [ [ 1, 2 ], [ 3, 4 ], [] ][ p ] );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 4 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'work with no items', async t => {
        const iterable = paginate( p => [ [] ][ p ] );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );
