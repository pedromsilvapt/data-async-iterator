import { AsyncIterableLike } from "../core";
import { SemaphoreLike, Semaphore } from "data-semaphore";
import { delay } from "./delay";
import { from } from '../constructors/from';
import { tap } from '../queries/tap';
import { range } from "../generators/range";
import { drain } from '../reducers/drain';

export function valve<T> ( iterable : AsyncIterableLike<T>, semaphore : SemaphoreLike ) : AsyncIterableIterator<T> {
    return delay( iterable, () => semaphore.acquire() );
}

export function release<T> ( iterable : AsyncIterableLike<T>, semaphore : SemaphoreLike ) {
    return tap( iterable, () => semaphore.release() );
}

export async function * releaseOnEnd<T> ( iterable : AsyncIterableLike<T>, semaphore : SemaphoreLike ) : AsyncIterableIterator<T> {
    try {
        yield * from( iterable );
    } finally {
        semaphore.release();
    }
}
