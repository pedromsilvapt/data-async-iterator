import { CancelToken } from "data-cancel-token";
import { AsyncIterableLike } from "../core";
import { cancellable } from "../transformers/cancellable";
import { reduce } from "./reduce";

export function inject<T, R> ( iterable : AsyncIterableLike<T>, reducer : ( memo : R, item : T ) => any, seed : R, cancel ?: CancelToken ) : Promise<R> {
    return reduce<T, R>( iterable, ( memo, item ) => {
        reducer( memo, item );
        
        return memo;
    }, seed, cancel );
}