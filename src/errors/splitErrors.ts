import { AsyncIterableLike } from "../core";
import { dup } from "../misc/shared";
import { filter } from "../transformers/filter";
import { mapErrors } from "./mapErrors";
import { skipErrors } from "./skipErrors";

export function splitErrors<T, E = any> ( iterable : AsyncIterableLike<T> ) : [ AsyncIterable<E>, AsyncIterable<T> ] {
    const [ iterable1, iterable2 ] = dup( iterable );

    const errors = mapErrors( filter( iterable1, () => false ), err => err ) as AsyncIterable<any>;

    const values = skipErrors( iterable2 );

    return [ errors, values ];
}
