import { AsyncIterableLike } from "../core";
import { Future } from "@pedromsilva/data-future";
import { from } from "../constructors/from";

export async function * throttle<T> ( iterable : AsyncIterableLike<T>, interval : number ) : AsyncIterableIterator<T> {
    let delayed : Future<void>;

    const wait = () => {
        delayed = new Future();

        setTimeout( () => {
            delayed.resolve();

            delayed = null;
        }, interval );
    };

    for await ( let value of from( iterable ) ) {
        if ( delayed ) {
            await delayed.promise;
        }

        wait();

        yield value;
    }
}