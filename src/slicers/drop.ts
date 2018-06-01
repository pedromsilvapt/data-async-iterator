import { AsyncIterableLike } from "../core";
import { slice } from "./slice";
import { from } from "../constructors/from";
import { fromArray } from "../constructors/fromArray";

export async function * drop<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterableIterator<T> {
    for await ( let item of from( iterable ) ) {
        if ( count > 0 ) {
            count--;

            continue;
        }

        yield item;
    }
}

export async function * dropWhile<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterableIterator<T> {
    let index = 0;

    let switched : boolean = false;

    for await ( let item of from( iterable ) ) {
        if ( !switched && !await predicate( item, index ) ) {
            continue;
        }

        switched = true;

        yield item;
        
        index++;
    }
}

export function dropUntil<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterableIterator<T> {
    return dropWhile( iterable, async ( item, index ) => !await predicate( item, index ) );
}

export function dropLast<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterableIterator<T> {
    return slice( iterable, 0, - count );
}