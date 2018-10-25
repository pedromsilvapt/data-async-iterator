import { AsyncIterableLike, toAsyncIterator } from "../core";
import { Mutex } from "data-semaphore";

export function safe<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            const mutex = new Mutex();
    
            const iterator = toAsyncIterator( iterable );
            
            let returned = false;
            
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },
        
                next ( input ?: any ) : Promise<IteratorResult<T>> {
                    return mutex.use( () =>{
                        if ( returned ) {
                            return { done: true, value: void 0 };
                        }

                        return iterator.next( input )
                    } );
                },
                
                return ( input ?: any ) : Promise<IteratorResult<T>> {
                    return mutex.use( () => {
                        returned = true;
        
                        if ( iterator.return ) {
                            return iterator.return( input );
                        } else {
                            return { done: true, value: input };
                        }
                    } );
                },
        
                throw ( input ?: any ) : Promise<IteratorResult<T>> {
                    return mutex.use( () => {
                        if ( iterator.throw ) {
                            return iterator.throw( input );
                        } else {
                            return Promise.reject( input );
                        }
                    } );
                }
            }
        }
    };
}