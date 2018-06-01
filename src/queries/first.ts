import { Optional } from "data-optional";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function first<T> ( iterable : AsyncIterableIterator<T>, cancel ?: CancelToken ) : Promise<Optional<T>> {
    for await ( let item of cancellable( iterable, cancel ) ) {
        return Optional.of( item );
    }

    return Optional.empty();
}
