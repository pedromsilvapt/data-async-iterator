import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function keyBy<K, V> ( iterable : AsyncIterableLike<V>, keyer : ( item : V ) => K, cancel ?: CancelToken ) : Promise<Map<K, V>> {
    const map : Map<K, V> = new Map();

    let key : K = null;

    for await ( let value of cancellable( iterable, cancel ) ) {
        key = keyer( value );

        map.set( key, value );
    }

    return map;
}