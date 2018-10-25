import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function takeErrors<I> ( iterable : AsyncIterableLike<I> ) : AsyncIterable<I> {
    return safe( {
        [ Symbol.asyncIterator ] () : AsyncIterableIterator<I> {
            const iterator = toAsyncIterator( iterable );
            
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input : any ) : Promise<IteratorResult<I>> {
                    return iterator.next( input ).then( result => {
                        if ( result.done ) return result;

                        return this.next( input );
                    } );
                },

                throw ( reason : any ) : Promise<IteratorResult<I>> {
                    if ( iterator.throw ) {
                        return iterator.throw( reason ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<I>>;
                    } else {
                        return Promise.reject( reason );
                    }
                },

                return ( value : any ) : Promise<IteratorResult<I>> {
                    if ( iterator.return ) {
                        return iterator.return( value ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<I>>
                    } else {
                        return Promise.resolve( { done: true, value } );
                    }
                }
            };
        }
    } );
}