import { AsyncIterableLike } from "../core";
import { Mutex } from "data-semaphore";
import { from } from "../constructors/from";

export function safe<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterableIterator<T> {
    const mutex = new Mutex();

    const iterator = from( iterable )[ Symbol.asyncIterator ]();
    
    return {
        [ Symbol.asyncIterator ] () {
            return this;
        },

        async next ( input ?: any ) : Promise<IteratorResult<T>> {
            return mutex.use( () => iterator.next( input ) );
        },
        
        async return ( input ?: any ) : Promise<IteratorResult<T>> {
            return mutex.use( () => iterator.return ? iterator.return( input ) : null );
        },

        async throw ( input ?: any ) : Promise<IteratorResult<T>> {
            return mutex.use( () => iterator.throw ? iterator.throw( input ) : null );
        }
    }
}