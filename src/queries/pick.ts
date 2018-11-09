import { AsyncIterableLike } from "../core";
import { Optional } from "data-optional";
import { CancelToken } from "data-cancel-token";
import { first } from "./first";
import { filter } from "../transformers/filter";

export async function pick<T> ( iterable : AsyncIterableLike<T>, index : number, cancel ?: CancelToken ) : Promise<Optional<T>> {
    return first( filter( iterable, ( _, i ) => i == index ) );
}
