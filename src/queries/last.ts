import { AsyncIterableLike, toAsyncIterable } from '../core';
import { Optional } from 'data-optional';

export async function last<T> ( iterable : AsyncIterableLike<T>, optional ?: false ) : Promise<T>;
export async function last<T> ( iterable : AsyncIterableLike<T>, optional : true ) : Promise<Optional<T>>;
export async function last<T> ( iterable : AsyncIterableLike<T>, optional : boolean ) : Promise<T | Optional<T>>;
export async function last<T> ( iterable : AsyncIterableLike<T>, optional : boolean = false ) : Promise<T | Optional<T>> {
    let item = null;
    let hasItem = false;

    for await ( let each of toAsyncIterable( iterable ) ) {
        hasItem = true;
        item = each;
    }

    if ( hasItem ) {
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