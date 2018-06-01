import { AsyncIterableLike } from "../core";
import { CancelToken } from 'data-cancel-token';
import { cancellable } from "../transformers/cancellable";

export async function forEach<T> ( iterable : AsyncIterableLike<T>, action : ( item : T ) => any | Promise<any>, cancel ?: CancelToken ) : Promise<void> {
    for await ( let item of cancellable( iterable, cancel ) ) {
        await action( item );
    }
}