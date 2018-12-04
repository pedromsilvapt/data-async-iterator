import { AsyncIterableLike, toAsyncIterable } from "../core";

export async function groupBy<K, V> ( iterable : AsyncIterableLike<V>, keyer : ( item : V ) => K ) : Promise<Map<K, V[]>>;
export async function groupBy<K, V, O = V> ( iterable : AsyncIterableLike<V>, keyer : ( item : V ) => K, transform : ( values : V[] ) => O ) : Promise<Map<K, O>>;
export async function groupBy<K, V, O = V> ( iterable : AsyncIterableLike<V>, keyer : ( item : V ) => K, transform ?: ( values : V[] ) => O ) : Promise<Map<K, O | V[]>> {
    const map : Map<K, V[]> = new Map();

    let key : K = null;

    for await ( let value of toAsyncIterable( iterable ) ) {
        key = keyer( value );

        let array : V[] = map.get( key );

        if ( !array ) {
            map.set( key, array = [] );
        }

        array.push( value );
    }

    if ( typeof transform === 'function' ) {
        for ( let [ key, value ] of map ) {
            map.set( key, transform( value ) as any );
        }
    }

    return map;
}