import { AsyncIterableLike, toAsyncIterable } from "../core";

export async function toMap<K, V> ( iterable : AsyncIterableLike<[ K, V ]> ) : Promise<Map<K, V>> {
    const map : Map<K, V> = new Map();

    for await ( let [ key, value ] of toAsyncIterable( iterable ) ) {
        map.set( key, value );
    }

    return map;
}