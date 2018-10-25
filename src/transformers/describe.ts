import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "./safe";

export type IterablePackage<T> = {
    event: "end";
} | {
    event : "value";
    value : T;
} | {
    event : "error";
    error : any;
};

export function describe<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<IterablePackage<T>> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            let isDone : boolean = false;

            const iterator = toAsyncIterator( iterable );
            
            const transform = async ( done : boolean, result : Promise<IteratorResult<T>> ) : Promise<IteratorResult<IterablePackage<T>>> => {
                try {
                    const { done, value } = await result;

                    if ( done ) {
                        isDone = true;
                        
                        return { done: done, value: { event: 'end' } };                    
                    } else {
                        return { done: done, value: { event: 'value', value: value } };
                    }
                } catch ( error ) {
                    return { done: done, value: { event: 'error', error: error } };
                }
            };

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<IterablePackage<T>>> {
                    if ( isDone ) {
                        return { done: true, value: null };
                    }

                    return transform( false, iterator.next( input ) );
                },

                return ( input : any ) : Promise<IteratorResult<IterablePackage<T>>> {
                    if ( iterator.return ) {
                        return transform( true, iterator.return( input ) );
                    } else {
                        return transform( true, Promise.resolve( { done: true, value: input } ) );
                    }
                },
                
                throw ( input : any ) : Promise<IteratorResult<IterablePackage<T>>> {
                    if ( iterator.throw ) {
                        return transform( isDone, iterator.throw( input ) );
                    } else {
                        return transform( isDone, Promise.reject( input ) );
                    }
                }
            }
        }
    } );
}