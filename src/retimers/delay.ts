import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function delay<T> ( iterable : AsyncIterableLike<T>, timestamp : number | ( () => Promise<any> ) ) : AsyncIterable<T> {
    const delayer = typeof timestamp === 'number' 
        ? () => new Promise( resolve => setTimeout( resolve, timestamp ) )
        : timestamp;

    const iterator = toAsyncIterator( iterable );

    return safe( {
        [ Symbol.asyncIterator ] () {
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    await delayer();
        
                    return iterator.next( input );
                },

                throw ( reason ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator.throw ) {
                        return iterator.throw( reason );
                    } else {
                        return Promise.reject( reason );
                    }
                },

                return ( value ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator.return ) {
                        return iterator.return( value );
                    } else {
                        return Promise.resolve( { done: true, value } );
                    }
                }
            };
        }
    } )
}