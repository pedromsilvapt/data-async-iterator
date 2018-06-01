import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function toMap<K, V> ( iterable : AsyncIterableLike<[ K, V ]>, cancel ?: CancelToken ) : Promise<Map<K, V>> {
    const map : Map<K, V> = new Map();

    for await ( let [ key, value ] of cancellable( iterable, cancel ) ) {
        map.set( key, value );
    }

    return map;
}