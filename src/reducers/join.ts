import { AsyncIterableLike } from "../core";
import { toArray } from "./toArray";

export function join<T> ( iterable : AsyncIterableLike<T>, separator = ',' ) : Promise<string> {
    return toArray( iterable ).then( items => items.join( separator ) );
}