import { AsyncIterableLike } from "../core";
import { from } from "../constructors/from";

export async function * filter<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterableIterator<T> {
    let result : boolean | Promise<boolean>;

    let index = 0;

    for await ( let item of from( iterable ) ) {
        result = predicate( item, index );

        if ( result instanceof Promise ) {
            if ( await result ) {
                yield item;
            }
        } else {
            if ( result ) {
                yield item;
            }
        }

        index++;
    }
}

export function reject<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterableIterator<T> {
    return filter( iterable, ( item, index ) => {
        let result : boolean | Promise<boolean> = predicate( item, index );
        
        if ( result instanceof Promise ) {
            return result.then( value => !value );
        }

        return !result;
    } );
}