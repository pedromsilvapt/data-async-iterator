import { AsyncIterableLike } from "../core";
import { SemaphoreLike, Semaphore } from "data-semaphore";
import { delay } from "./delay";
import { tap } from '../queries/tap';
import { observe } from "../transformers/observe";

export function valve<T> ( iterable : AsyncIterableLike<T>, semaphore : SemaphoreLike ) : AsyncIterable<T> {
    return delay( iterable, () => semaphore.acquire() );
}

export function release<T> ( iterable : AsyncIterableLike<T>, semaphore : SemaphoreLike ) : AsyncIterable<T> {
    return tap( iterable, () => semaphore.release() );
}

export function releaseOnEnd<T> ( iterable : AsyncIterableLike<T>, semaphore : SemaphoreLike ) : AsyncIterable<T> {
    return observe( iterable, {
        onEnd () {
            semaphore.release();
        }
    } );
}