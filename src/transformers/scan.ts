import { AsyncIterableLike } from "../core";
import { from } from "../constructors/from";

export async function * scan<T, R> ( iterable : AsyncIterableLike<T>, reducer : ( memo : R, item : T ) => R, seed : R ) : AsyncIterableIterator<R> {
    for await ( let item of from( iterable ) ) {
        yield seed = reducer( seed, item );
    }
}

export async function * scanSelf<T> ( iterable : AsyncIterableLike<T>, reducer : ( memo : T, item : T ) => T ) : AsyncIterableIterator<T> {
    let hasSeed : boolean = false;
    let seed : T = null;

    for await ( let item of from( iterable ) ) {
        if ( hasSeed ) {
            seed = reducer( seed, item );
        } else {
            hasSeed = true;
            seed = item;
        }

        yield seed;
    }
}