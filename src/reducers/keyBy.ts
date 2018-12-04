import { AsyncIterableLike, toAsyncIterable } from "../core";

export async function keyBy<K, V> ( iterable : AsyncIterableLike<V>, keyer : ( item : V ) => K ) : Promise<Map<K, V>> {
    const map : Map<K, V> = new Map();

    let key : K = null;

    for await ( let value of toAsyncIterable( iterable ) ) {
        key = keyer( value );

        map.set( key, value );
    }

    return map;
}