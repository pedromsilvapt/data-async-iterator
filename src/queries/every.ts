import { AsyncIterableLike, toAsyncIterable } from "../core";

export async function every<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : Promise<boolean> {
    let result : boolean | Promise<boolean>;

    let index = 0;

    for await ( let item of toAsyncIterable( iterable ) ) {
        result = predicate( item, index );

        if ( result instanceof Promise ) {
            if ( !await result ) {
                return false;
            }
        } else {
            if ( !result ) {
                return false;
            }
        }

        index++;
    }

    return true;
}