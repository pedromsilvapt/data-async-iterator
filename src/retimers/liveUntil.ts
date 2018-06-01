import { AsyncIterableLike } from "../core";
import { from } from '../constructors/from';


export async function * liveUntil<T> ( iterable : AsyncIterableLike<T>, promise : Promise<void> ) : AsyncIterableIterator<T> {
    yield * from( iterable );

    await promise;
}