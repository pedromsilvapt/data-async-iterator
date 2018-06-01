import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { toArray } from "./toArray";

export function join<T> ( iterable : AsyncIterableLike<T>, separator = ',', cancel ?: CancelToken ) : Promise<string> {
    return toArray( iterable, cancel ).then( items => items.join( separator ) );
}