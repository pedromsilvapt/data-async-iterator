import { AsyncIterableLike } from '../core';
import { slice } from './slice';

export function init<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterableIterator<T> {
    return slice( iterable, 0, -1 );
}