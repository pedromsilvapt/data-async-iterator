import { Optional } from "data-optional";
import { AsyncIterableLike, toAsyncIterable } from "../core";

export async function first<T> ( iterable : AsyncIterableLike<T>, optional ?: false ) : Promise<T>;
export async function first<T> ( iterable : AsyncIterableLike<T>, optional : true ) : Promise<Optional<T>>;
export async function first<T> ( iterable : AsyncIterableLike<T>, optional : boolean ) : Promise<T | Optional<T>>;
export async function first<T> ( iterable : AsyncIterableLike<T>, optional : boolean = false ) : Promise<T | Optional<T>> {
    for await ( let item of toAsyncIterable( iterable ) ) {
        if ( optional ) {
            return Optional.of( item );
        } else {
            return item;
        }
    }

    if ( optional ) {
        return Optional.empty();
    } else {
        return null;
    }
}
