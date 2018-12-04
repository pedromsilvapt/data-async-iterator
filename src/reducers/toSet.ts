import { AsyncIterableLike, toAsyncIterable } from "../core";

export async function toSet<T> ( iterable : AsyncIterableLike<T> ) : Promise<Set<T>> {
    const set : Set<T> = new Set();

    for await ( let item of toAsyncIterable( iterable ) ) {
        set.add( item );
    }

    return set;
}