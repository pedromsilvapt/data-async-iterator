import { CancelToken } from "data-cancel-token";
import { AsyncIterableLike } from "../core";
import { cancellable } from "../transformers/cancellable";

export async function toArray<T> ( iterable : AsyncIterableLike<T>, cancel ?: CancelToken ) : Promise<T[]> {
    const array : T[] = []

    for await ( let item of cancellable( iterable, cancel ) ) {
        array.push( item );
    }

    return array;
}