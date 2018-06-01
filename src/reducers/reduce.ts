import { CancelToken } from "data-cancel-token";
import { AsyncIterableLike } from "../core";
import { cancellable } from "../transformers/cancellable";

export async function reduce<T, R> ( iterable : AsyncIterableLike<T>, reducer : ( memo : R, item : T ) => R, seed : R, cancel ?: CancelToken ) : Promise<R> {
    for await ( let item of cancellable( iterable, cancel ) ) {
        seed = reducer( seed, item );
    }

    return seed;
}