import { Comparator, sorting } from 'data-collectors';
import { AsyncIterableLike } from '../core';
import { flatten } from '../combinators/flatMap';
import { collect } from '../reducers/collect';

export function sort<T> ( iterable : AsyncIterableLike<T>, comparator ?: Comparator<T> ) : AsyncIterable<T> {
    return flatten( collect( iterable, sorting( comparator ) ) );
}