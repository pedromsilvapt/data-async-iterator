import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function toSet<T> ( iterable : AsyncIterableLike<T>, cancel ?: CancelToken ) : Promise<Set<T>> {
    const set : Set<T> = new Set();

    for await ( let item of cancellable( iterable, cancel ) ) {
        set.add( item );
    }

    return set;
}