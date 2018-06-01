import { AsyncIterableLike, isAsyncIterable, isSync } from "../core";

export function from<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            if ( isAsyncIterable( iterable ) ) {
                return iterable[ Symbol.asyncIterator ]();
            } else if ( isSync( iterable ) ) {
                return fromSync<T>( iterable );
            } else {
                return fromPromise<T>( iterable );
            }
        }
    }
}

export async function * fromSync<T> ( iterable : Iterable<T> ) : AsyncIterableIterator<T> {
    for ( let item of iterable ) yield item;
}

export async function * fromPromise<T> ( promise : Promise<T> ) : AsyncIterableIterator<T> {
    yield await promise;
}