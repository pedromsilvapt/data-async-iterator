import { AsyncIterableLike } from "../core";
import { from } from "../constructors/from";

export async function * map<I, O> ( iterable : AsyncIterableLike<I>, mapper : ( item : I, index : number ) => O | Promise<O> ) : AsyncIterableIterator<O> {
    let index = 0;

    for await ( let item of from( iterable ) ) {
        yield mapper( item, index );

        index++;
    }
}