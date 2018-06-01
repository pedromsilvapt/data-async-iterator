import { AsyncIterableLike } from '../core';
import { Optional } from 'data-optional';
import { CancelToken } from 'data-cancel-token';
import { cancellable } from '../transformers/cancellable';

export async function last<T> ( iterable : AsyncIterableLike<T>, cancel ?: CancelToken ) : Promise<Optional<T>> {
    let item = null;
    let hasItem = false;

    for await ( let each of cancellable( iterable, cancel ) ) {
        hasItem = true;
        item = each;
    }

    if ( hasItem ) {
        return Optional.of( item );
    }

    return Optional.empty();
}