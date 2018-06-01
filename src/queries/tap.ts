import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";
import { from } from "../constructors/from";

export async function * tap<T> ( iterable : AsyncIterableLike<T>, action : ( item : T, index : number ) => any | Promise<any> ) : AsyncIterableIterator<T> {
    let result : any | Promise<any>;

    let index = 0;

    for await ( let item of from( iterable ) ) {
        result = action( item, index );

        if ( result instanceof Promise ) {
            await result;
        }

        index++;

        yield item;
    }
}