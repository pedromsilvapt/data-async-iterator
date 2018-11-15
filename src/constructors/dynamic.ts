import { AsyncIterableLike, toAsyncIterableIterator } from "../core";
import { safe } from "../transformers/safe";

export function dynamic<T> ( factory : () => AsyncIterableLike<T> ) {
    return safe( {
        [ Symbol.asyncIterator ] () {
            return toAsyncIterableIterator( factory() );
        }
    } );
}
