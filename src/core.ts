export type AsyncIterableLike<T> = AsyncIterable<T> | AsyncIterableIterator<T> | Iterable<T> | Promise<T>;

export function isAsync<T> ( iterable : AsyncIterableLike<T> ) : iterable is ( AsyncIterable<T> | Promise<T> ) {
    if ( iterable && ( isAsyncIterable( iterable ) || iterable instanceof Promise ) ) {
        return true;
    }

    return false;
}

export function isAsyncIterable<T> ( iterable : AsyncIterableLike<T> ) : iterable is AsyncIterable<T> {
    if ( iterable && ( iterable as any )[ Symbol.asyncIterator ] ) {
        return true;
    }

    return false;
}

export function isSync<T> ( iterable : AsyncIterableLike<T> ) : iterable is Iterable<T> {
    if ( iterable && ( iterable as any )[ Symbol.iterator ] ) {
        return true;
    }

    return false;
}