import { AsyncIterableLike } from "../core";
import { Optional } from "data-optional";
import { reduce } from "../reducers/reduce";
import { CancelToken } from "data-cancel-token";

export async function count<T> ( iterable : AsyncIterableLike<T>, index : number, cancel ?: CancelToken ) : Promise<number> {
    return reduce( iterable, ( c, _ ) => c + 1, 0, cancel );
}