import { AsyncIterableLike } from "../core";
import { from } from "../constructors/from";
import { safe } from "../transformers/safe";

export function delay<T> ( iterable : AsyncIterableLike<T>, timestamp : number | ( () => Promise<any> ) ) : AsyncIterableIterator<T> {
    const delayer = typeof timestamp === 'number' 
        ? () => new Promise( resolve => setTimeout( resolve, timestamp ) )
        : timestamp;

    const iterator = from( iterable )[ Symbol.asyncIterator ]();

    return safe( {
        [ Symbol.asyncIterator ] () {
            return this;
        },
        async next ( input ?: any ) : Promise<IteratorResult<T>> {
            await delayer();

            return iterator.next( input );
        },
        return ( input ?: any ) : Promise<IteratorResult<T>> {
            return iterator.return( input );
        },
        throw ( input ?: any ) : Promise<IteratorResult<T>> {
            return iterator.throw( input );
        }
    } )
}