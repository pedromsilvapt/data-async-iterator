import { AsyncIterableLike } from "../core";
import { slice } from "./slice";

export function tail<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<T> {
    return slice( iterable, 1, Infinity );
}