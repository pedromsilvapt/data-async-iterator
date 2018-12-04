import { CancelToken } from "data-cancel-token";
import { Optional } from "data-optional";
import { AsyncIterableLike } from "../core";
import { filter } from "../transformers/filter";
import { first } from "./first";
import { last } from "./last";

export function find<T> ( iterable : AsyncIterableLike<T>, predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, optional ?: false ) : Promise<T>;
export function find<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => Promise<boolean> | boolean, optional : true ) : Promise<Optional<T>>;
export function find<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => Promise<boolean> | boolean, optional : boolean ) : Promise<T | Optional<T>>;
export function find<T> ( iterable : AsyncIterableLike<T>, predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, optional : boolean = false ) : Promise<T | Optional<T>> {
    return first( filter( iterable, predicate ), optional );
}

export function findLast<T> ( iterable : AsyncIterableLike<T>, predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, optional ?: false ) : Promise<T>;
export function findLast<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => Promise<boolean> | boolean, optional : true ) : Promise<Optional<T>>;
export function findLast<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => Promise<boolean> | boolean, optional : boolean ) : Promise<T | Optional<T>>;
export function findLast<T> ( iterable : AsyncIterableLike<T>, predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, optional : boolean = false ) : Promise<T | Optional<T>> {
    return last( filter( iterable, predicate ), optional );
}