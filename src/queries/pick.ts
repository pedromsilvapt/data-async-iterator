import { AsyncIterableLike } from "../core";
import { Optional } from "data-optional";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function pick<T> ( iterable : AsyncIterableLike<T>, index : number, cancel ?: CancelToken ) : Promise<Optional<T>> {
    let eachIndex = 0;

    for await ( let item of cancellable( iterable, cancel ) ) {
        if ( index == eachIndex ) {
            return Optional.of( item );
        }

        eachIndex++;
    }

    return Optional.empty();
}