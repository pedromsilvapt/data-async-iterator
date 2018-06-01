import { Either } from '@pedromsilva/data-either';
import { Future } from '@pedromsilva/data-future';
import { Semaphore } from 'data-semaphore';
import { AsyncIterableLike } from "../core";
import { forEach } from "../reducers/forEach";
import { from } from "../constructors/from";
import { CancelToken } from 'data-cancel-token';
import { flattenConcurrent } from './flatMap';

export function merge<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> ) : AsyncIterableIterator<T> {
    return flattenConcurrent( iterables, Infinity );
}
