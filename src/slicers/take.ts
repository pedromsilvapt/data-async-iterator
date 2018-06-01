import { AsyncIterableLike } from "../core";
import { slice } from "./slice";
import { from } from "../constructors/from";

export async function * take<T> ( iterable : AsyncIterable<T>, count : number ) : AsyncIterableIterator<T> {
    if ( !count ) {
        return;
    }

    for await ( let item of iterable ) {
        yield item;

        count -= 1;

        if ( !count ) {
            break;
        }
    }
}

export async function * takeWhile<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterableIterator<T> {
    let index = 0;

    for await ( let item of from( iterable ) ) {
        if ( !await predicate( item, index ) ) {
            break;
        }

        yield item;
        
        index++;
    }
}

export function takeUntil<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterableIterator<T> {
    return takeWhile( iterable, async ( item, index ) => !await predicate( item, index ) );
}

export function takeLast<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterableIterator<T> {
    return slice( iterable, - count, Infinity );
}