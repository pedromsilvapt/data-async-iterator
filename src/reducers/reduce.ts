import { AsyncIterableLike, toAsyncIterable } from "../core";

export async function reduce<T, R> ( iterable : AsyncIterableLike<T>, reducer : ( memo : R, item : T ) => R, seed : R ) : Promise<R> {
    for await ( let item of toAsyncIterable( iterable ) ) {
        seed = reducer( seed, item );
    }

    return seed;
}