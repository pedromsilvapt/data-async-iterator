import { AsyncIterableLike, toAsyncIterable } from "../core";

export async function toArray<T> ( iterable : AsyncIterableLike<T> ) : Promise<T[]> {
    const array : T[] = []

    for await ( let item of toAsyncIterable( iterable ) ) {
        array.push( item );
    }

    return array;
}