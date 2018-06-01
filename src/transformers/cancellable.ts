import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { from } from "../constructors/from";

export async function * cancellable<T> ( iterable : AsyncIterableLike<T>, cancel : CancelToken ) : AsyncIterableIterator<T> {
    for await ( let item of from( iterable ) ) {
        if ( cancel && cancel.cancellationRequested ) break;
        
        yield item;
        
        if ( cancel && cancel.cancellationRequested ) break;
    }
}