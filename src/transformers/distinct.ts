import { reject } from "./filter";
import { AsyncIterableLike } from "../core";
import { scan } from "./scan";
import { from } from "../constructors/from";

export function distinct<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterableIterator<T> {
    const history : Set<T> = new Set<T>();

    return reject( iterable, item => {
        if ( history.has( item ) ) {
            return true;
        }
        
        history.add( item );
        
        return false;
    } );
}

export async function * distinctUntilChanged<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterableIterator<T> {
    let has : boolean = false;
    let lastValue : T = null;

    for await ( let value of from( iterable ) ) {
        if ( !has || lastValue !== value ) {
            yield value;
        }

        has = true;
        lastValue = value;
    }
}