import { AsyncIterableLike } from "../core";
import { flattenConcurrent } from './flatMap';

export function merge<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> ) : AsyncIterable<T> {
    return flattenConcurrent( iterables, Infinity );
}
