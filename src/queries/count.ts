import { AsyncIterableLike } from "../core";
import { reduce } from "../reducers/reduce";

export async function count<T> ( iterable : AsyncIterableLike<T> ) : Promise<number> {
    return reduce( iterable, ( c, _ ) => c + 1, 0 );
}
