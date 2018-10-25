import { AsyncIterableLike, toAsyncIterator, toAsyncIterable } from "../core";
import { CancelToken } from "data-cancel-token";
import { safe } from "./safe";
import { Future } from "@pedromsilva/data-future";

class ReusableFuture<T> {
    protected innerFuture : Future<T>;

    get promise () : Promise<T> {
        return this.innerFuture.promise;
    }

    reset () : this {
        this.innerFuture = new Future();

        return this;
    }

    resolve ( value ?: T | PromiseLike<T> ) {
        if ( this.innerFuture != null ) {
            const tmpFuture = this.innerFuture;

            this.innerFuture = null;
            
            tmpFuture.resolve( value );
        }
    }

    reject ( reason ?: any | Promise<any> ) {
        if ( this.innerFuture != null ) {
            const tmpFuture = this.innerFuture;

            this.innerFuture = null;
            
            tmpFuture.reject( reason );
        }
    }
}

export function cancellable<T> ( iterable : AsyncIterableLike<T>, cancel ?: CancelToken ) : AsyncIterable<T> {
    if ( !cancel ) {
        return toAsyncIterable( iterable );
    }

    return safe( {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let returned = false;

            let future : ReusableFuture<IteratorResult<T>> = new ReusableFuture();

            cancel.cancellationPromise.then( () => {
                future.resolve( iterator.return() );
            } );

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input ?: any ) : Promise<IteratorResult<T>> {
                    if ( returned || cancel.cancellationRequested ) {
                        return Promise.resolve( { done: true, value: void 0 } );
                    }

                    future.reset();

                    iterator.next( input )
                        .then( result => future.resolve( result ) )
                        .catch( err => future.reject( err ) );

                    return future.promise;
                },
                
                return ( input ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator.return ) {
                        return iterator.return( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<T>>;
                    } else {
                        return Promise.resolve( { done: true, value: input } );
                    }
                },
        
                throw ( input ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator.throw ) {
                        return iterator.throw( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<T>>;;
                    } else {
                        return Promise.reject( input );
                    }
                }
            };
        }
    } );
}
