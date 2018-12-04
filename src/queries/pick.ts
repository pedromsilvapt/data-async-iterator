import { AsyncIterableLike } from "../core";
import { Optional } from "data-optional";
import { first } from "./first";
import { filter } from "../transformers/filter";

export function pick<T> ( iterable : AsyncIterableLike<T>, index : number, optional ?: false ) : Promise<T>;
export function pick<T> ( iterable : AsyncIterableLike<T>, index : number, optional : true ) : Promise<Optional<T>>;
export function pick<T> ( iterable : AsyncIterableLike<T>, index : number, optional : boolean ) : Promise<T | Optional<T>>;
export function pick<T> ( iterable : AsyncIterableLike<T>, index : number, optional : boolean = false ) : Promise<T | Optional<T>> {
    return first( filter( iterable, ( _, i ) => i == index ), optional );
}
