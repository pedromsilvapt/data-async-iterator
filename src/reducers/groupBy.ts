import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function groupBy<K, V> ( iterable : AsyncIterableLike<V>, keyer : ( item : V ) => K, cancel ?: CancelToken ) : Promise<Map<K, V[]>>;
export async function groupBy<K, V, O = V> ( iterable : AsyncIterableLike<V>, keyer : ( item : V ) => K, transform : ( values : V[] ) => O, cancel ?: CancelToken ) : Promise<Map<K, O>>;
export async function groupBy<K, V, O = V> ( iterable : AsyncIterableLike<V>, keyer : ( item : V ) => K, transform ?: ( ( values : V[] ) => O ) | CancelToken, cancel ?: CancelToken ) : Promise<Map<K, O | V[]>> {
    const map : Map<K, V[]> = new Map();

    let key : K = null;

    if ( transform && typeof transform !== 'function' ) {
        cancel = transform;
        transform = null;
    }

    for await ( let value of cancellable( iterable, cancel ) ) {
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