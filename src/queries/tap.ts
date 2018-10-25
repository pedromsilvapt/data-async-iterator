import { AsyncIterableLike } from "../core";
import { observe } from "../transformers/observe";

export function tap<T> ( iterable : AsyncIterableLike<T>, action : ( item : T, index : number ) => any | Promise<any> ) : AsyncIterable<T> {
    return observe( iterable, { onValue: action } );
}
