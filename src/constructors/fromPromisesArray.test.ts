import test from 'blue-tape';
import { fromPromisesArray } from './fromPromisesArray';

const delayed = <T>( value : T, delay : number ) : Promise<T> => {
    return new Promise<T>( resolve => setTimeout( () => resolve( value ), delay ) );
}

test( '#fromPromisesArray', async t => {
    t.test( 'first in first out order', async t => {
        const iterable = fromPromisesArray( [
            delayed( 1, 100 ),
            delayed( 3, 400 ),
            delayed( 2, 300 ),
            delayed( 15, 200 )
        ] );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 15 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );

    t.test( 'sequential', async t => {
        const iterable = fromPromisesArray( [
            delayed( 1, 100 ),
            delayed( 3, 400 ),
            delayed( 2, 300 ),
            delayed( 15, 200 )
        ], true );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 2 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 15 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
    t.test( 'sequential with errors', async t => {
        const iterable = fromPromisesArray( [
            delayed( 1, 100 ),
            delayed( 3, 300 ),
            delayed( 2, 200 ).then( () => Promise.reject( new Error( 'fromPromises' ) ) ),
            delayed( 15, 150 )
        ], true );

        const iterator = iterable[ Symbol.asyncIterator ]();

        t.deepLooseEqual( await iterator.next(), { done: false, value: 1 } );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 3 } );
        await t.shouldFail( iterator.next(), 'fromPromises' );
        t.deepLooseEqual( await iterator.next(), { done: false, value: 15 } );
        t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
    } );
} );