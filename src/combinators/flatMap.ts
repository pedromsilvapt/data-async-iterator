import { AsyncIterableLike, toAsyncIterator } from "../core";
import { Semaphore } from "data-semaphore";
import { Either } from "@pedromsilva/data-either";
import { Future } from "@pedromsilva/data-future";
import { forEach } from "../reducers/forEach";
import { CancelToken } from "data-cancel-token";
import { map } from "../transformers/map";
import { safe } from "../transformers/safe";

export function flatMap<T, U> ( iterables : AsyncIterableLike<T>, mapper : ( item : T, index : number ) => Promise<AsyncIterableLike<U>> | AsyncIterableLike<U> ) : AsyncIterable<U> {
    return flatten( map<T, AsyncIterableLike<U>>( iterables, mapper ) );
}

export function flatMapLast<T, U> ( iterables : AsyncIterableLike<T>, mapper : ( item : T, index : number ) => Promise<AsyncIterableLike<U>> | AsyncIterableLike<U>, concurrency : number ) : AsyncIterable<U> {
    return flattenLast( map<T, AsyncIterableLike<U>>( iterables, mapper ), concurrency );
}

export function flatMapConcurrent<T, U> ( iterables : AsyncIterableLike<T>, mapper : ( item : T, index : number ) => Promise<AsyncIterableLike<U>> | AsyncIterableLike<U>, concurrency : number ) : AsyncIterable<U> {
    return flattenConcurrent( map<T, AsyncIterableLike<U>>( iterables, mapper ), concurrency );
}

export function flatten<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> ) : AsyncIterable<T> {
    return flattenConcurrent( iterables, 1 );
}

export function flattenLast<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>>, concurrency : number ) : AsyncIterable<T> {
    return flattenConcurrent( iterables, concurrency, true );
}

export function flattenConcurrent<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>>, concurrency : number, switchFast : boolean = false ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            const iteratorsExclusion : Semaphore = new Semaphore( 1 );

            const iteratorsConcurrency : Semaphore = new Semaphore( concurrency - 1 );

            let returned : boolean = false;

            // Boolean that indicates when no more iterables are coming
            let drainedMain : boolean = false;

            // If any iterable throws, the exception is saved here to be returned whenever any next item is requested
            let exception : any = null;

            // An unbounded set of all running iterators
            // When a iterator ends, it is removed from this set
            let iterators : Set<AsyncIterator<T>> = new Set();

            let iteratorsOrdered : AsyncIterator<T>[] = [];

            let buffer : [AsyncIterator<T>, Either<T, any>][] = [];

            let future : Future<IteratorResult<T>> = null;

            const pull = async ( iter : AsyncIterator<T> ) => {
                try {
                    const { done, value } = await iter.next();

                    if ( !iterators.has( iter ) ) {
                        if ( done && iter.return ) {
                            await iter.return();
                        }

                        return;
                    }

                    if ( done ) {
                        iterators.delete( iter );

                        if ( switchFast ) {
                            iteratorsOrdered = iteratorsOrdered.filter( each => each !== iter );
                        }

                        iteratorsConcurrency.release();

                        // If all sources dried out
                        if ( drainedMain && iterators.size == 0 ) {
                            if ( future ) {
                                future.resolve( { done: true, value: null } );
                                future = null;
                            }
                        }
                    } else {
                        if ( future ) {
                            future.resolve( { done: false, value } );
                            future = null;
            
                            pull( iter );
                        } else {
                            buffer.push( [ iter, Either.left( value ) ] );
                        }
                    }
                } catch ( err ) {
                    if ( future ) {
                        future.reject( err );
                        future = null;

                        pull( iter );
                    } else {
                        buffer.push( [ iter, Either.right( err ) ] );
                    }
                }
            };

            const iterablesTask : CancelToken = new CancelToken();

            forEach( iterables, async source => {
                if ( switchFast && iteratorsOrdered.length == concurrency ) {
                    const oldest = iteratorsOrdered.shift();

                    iterators.delete( oldest );
                }

                const iter = toAsyncIterator( source );

                iterators.add( iter );

                if ( switchFast ) {
                    iteratorsOrdered.push( iter );
                }

                pull( iter );

                // switchFast == true means that we get a new iterable as soon as possible. When one arrives,
                // if the iterables buffer is full, the oldest one gets discarded
                // switchFast == false means that when the iterators buffer is full, we wait until one ends
                // before requesting another
                if ( !switchFast ) {
                    await iteratorsConcurrency.acquire();
                }
            }, iterablesTask ).then( () => {
                drainedMain = true;

                if ( iterators.size == 0 && buffer.length == 0 && future ) {
                    future.resolve( { done: true, value: null } );

                    future = null;
                }
            } ).catch( err => exception = err );

            return {
                [Symbol.asyncIterator] () : AsyncIterableIterator<T> {
                    return this;
                },

                async next () : Promise<IteratorResult<T>> {
                    await iteratorsExclusion.acquire();

                    try {
                        if ( exception ) {
                            return Promise.reject( exception );
                        }
            
                        if ( returned || ( buffer.length == 0 && drainedMain && iterators.size == 0 ) ) {
                            return Promise.resolve<IteratorResult<T>>( { done: true, value: null } );
                        }
            
                        if ( buffer.length == 0 ) {
                            future = new Future();
            
                            return await future.promise;
                        }
            
                        const [ iter, res ] = buffer.shift();
            
                        pull( iter );
            
                        return await res.reduce( value => Promise.resolve( { done: false, value } ), err => Promise.reject( err ) );
                    } finally {
                        iteratorsExclusion.release();
                    }
                },

                async return ( value ?: any ) : Promise<IteratorResult<T>> {
                    await iteratorsExclusion.acquire();
                    
                    try {
                        returned = true;
            
                        iterablesTask.cancel();
            
                        await Array.from( iterators ).map( iter => iter.return ? iter.return( value ) : null );
            
                        iterables = null;
            
                        iterators.clear();
            
                        buffer = [];
            
                        return { done: true, value: value || null };
                    } finally {
                        iteratorsExclusion.release();
                    }
                }
            }
        }
    } );
}