import { Comparator, sorting } from 'data-collectors';
import { AsyncIterableLike } from '../core';
import { flatten } from '../combinators/flatMap';
import { collect } from '../reducers/collect';
import { dynamic } from '../constructors/dynamic';

export function sort<T> ( iterable : AsyncIterableLike<T>, comparator ?: Comparator<T> ) : AsyncIterable<T> {
    return flatten( dynamic( () => collect( iterable, sorting( comparator ) ), true ) );
}