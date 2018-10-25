import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";
import { shared, dup } from "../shared";
import { filter } from "../transformers/filter";
import { mapErrors } from "./mapErrors";
import { skipErrors } from "./skipErrors";

export function splitErrors<T> ( iterable : AsyncIterableLike<T> ) : [ AsyncIterable<any>, AsyncIterable<T> ] {
    const [ iterable1, iterable2 ] = dup( iterable );

    const errors = mapErrors( filter( iterable1, () => false ), err => err );

    const values = skipErrors( iterable2 );

    return [ errors, values ];
}