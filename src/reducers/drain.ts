import { AsyncIterableLike, toAsyncIterator } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function drain ( iterable : AsyncIterableLike<any>, cancel ?: CancelToken, ignoreErrors : boolean = false ) : Promise<void> {
    const iterator = toAsyncIterator( cancellable( iterable, cancel ) );

    while ( true ) {
        try {
            const { done } = await iterator.next();

            if ( done ) {
                break;
            }
        } catch ( error ) {
            if ( !ignoreErrors ) {
                await iterator.return();

                throw error;
            }
        }
    }
}