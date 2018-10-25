import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function throwIf<T> ( iterable : AsyncIterableLike<T>, predicate : ( value : T, index : number ) => boolean | Error | Promise<boolean> | Promise<Error> | Promise<never> = null ) : AsyncIterable<T> {
    if ( !predicate ) {
        predicate = value => value instanceof Error;
    }

    return safe( {
        [ Symbol.asyncIterator ] () : AsyncIterableIterator<T> {
            let index = 0;

            const iterator = toAsyncIterator( iterable );
            
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input : any ) : Promise<IteratorResult<T>> {
                    const result = await iterator.next( input );
                    
                    if ( result.done ) {
                        return result;
                    }

                    const error = await predicate( result.value, index++ );

                    if ( error instanceof Error ) {
                        throw error;
                    } else if ( error ) {
                        throw result.value;
                    }

                    return result;
                },

                throw ( reason : any ) : Promise<IteratorResult<T>> {
                    if ( iterator.throw ) {
                        return iterator.throw( reason );
                    } else {
                        return Promise.reject( reason );
                    }
                },

                return ( value : any ) : Promise<IteratorResult<T>> {
                    if ( iterator.return ) {
                        return iterator.return( value );
                    } else {
                        return Promise.resolve( { done: true, value } );
                    }
                }
            };
        }
    } );
}