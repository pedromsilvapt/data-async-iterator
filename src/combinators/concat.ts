import { AsyncIterableLike } from "../core";
import { from } from "../constructors/from";

export async function * concat<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> ) : AsyncIterableIterator<T> {
    for await ( let iter of from( iterables ) ) {
        yield * from( iter );
    }
}