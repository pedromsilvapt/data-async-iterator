import { CancelToken } from "data-cancel-token";
import { Optional } from "data-optional";
import { AsyncIterableLike } from "../core";
import { filter } from "../transformers/filter";
import { first } from "./first";
import { last } from "./last";

export function find<T> ( iterable : AsyncIterableLike<T>, predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, cancel ?: CancelToken ) : Promise<Optional<T>> {
    return first( filter( iterable, predicate ), cancel );
}

export function findLast<T> ( iterable : AsyncIterableLike<T>, predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, cancel ?: CancelToken ) : Promise<Optional<T>> {
    return last( filter( iterable, predicate ), cancel );
}