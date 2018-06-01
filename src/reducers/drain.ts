import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function drain ( iterable : AsyncIterableLike<any>, cancel ?: CancelToken ) : Promise<void> {
    for await ( let item of cancellable( iterable, cancel ) );
}