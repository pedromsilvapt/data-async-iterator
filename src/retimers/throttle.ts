import { AsyncIterableLike, toAsyncIterator } from "../core";
import { Future } from "@pedromsilva/data-future";
import { safe } from "../transformers/safe";

export function throttle<T> ( iterable : AsyncIterableLike<T>, interval : number ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let delayed : Future<void>;

            const wait = () => {
                delayed = new Future();
        
                setTimeout( () => {
                    delayed.resolve();
        
                    delayed = null;
                }, interval );
            };

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    if ( delayed ) {
                        await delayed.promise;
                    }
            
                    wait();
            
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
    } );
}
