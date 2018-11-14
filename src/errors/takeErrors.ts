import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function takeErrors<E = any> ( iterable : AsyncIterableLike<any> ) : AsyncIterable<E> {
    return safe( {
        [ Symbol.asyncIterator ] () : AsyncIterableIterator<E> {
            const iterator = toAsyncIterator( iterable );
            
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input : any ) : Promise<IteratorResult<E>> {
                    return iterator.next( input ).then( result => {
                        if ( result.done ) return result;

                        return this.next( input );
                    }, err => {
                        return { done: false, value: err as E };
                    } );
                },

                throw ( reason : any ) : Promise<IteratorResult<E>> {
                    if ( iterator.throw ) {
                        return iterator.throw( reason ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<E>>;
                    } else {
                        return Promise.reject( reason );
                    }
                },

                return ( value : any ) : Promise<IteratorResult<E>> {
                    if ( iterator.return ) {
                        return iterator.return( value ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<E>>
                    } else {
                        return Promise.resolve( { done: true, value } );
                    }
                }
            };
        }
    } );
}
