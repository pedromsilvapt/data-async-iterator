import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function filterErrors<I> ( iterable : AsyncIterableLike<I>, predicate : ( err : any, index : number ) => boolean | Promise<boolean> | Promise<never> ) : AsyncIterable<I> {
    return safe( {
        [ Symbol.asyncIterator ] () : AsyncIterableIterator<I> {
            let index = 0;

            const iterator = toAsyncIterator( iterable );
            
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input : any ) : Promise<IteratorResult<I>> {
                    return iterator.next( input ).catch( error => {
                        return Promise.resolve( predicate( error, index++ ) ).then( value => {
                            if ( !value ) return this.next( input );

                            return Promise.reject( error );
                        } );
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