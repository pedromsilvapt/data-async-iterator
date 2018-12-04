import { AsyncIterableLike } from "../core";
import { reduce } from "./reduce";

export function inject<T, R> ( iterable : AsyncIterableLike<T>, reducer : ( memo : R, item : T ) => any, seed : R ) : Promise<R> {
    return reduce<T, R>( iterable, ( memo, item ) => {
        reducer( memo, item );
        
        return memo;
    }, seed );
}
