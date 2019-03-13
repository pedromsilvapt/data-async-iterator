import { AsyncIterableLike } from '../core';
import { flatMapConcurrent } from './flatMap';

export function parallel <T, U> ( iterable : AsyncIterableLike<T>, fn : ( item : T, index : number ) => U | Promise<U> | Promise<never>, concurent : number ) : AsyncIterable<U> {
    return flatMapConcurrent( iterable, ( item, index ) => Promise.resolve( fn( item, index ) ).then( i => [ i ] ), concurent );
}