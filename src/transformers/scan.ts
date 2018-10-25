import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "./safe";

export function scan<T, R> ( iterable : AsyncIterableLike<T>, reducer : ( memo : R, item : T ) => R | Promise<R>, seed : R ) : AsyncIterable<R> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            let iterator = toAsyncIterator( iterable );

            let iteratorSeed = seed;
            
            return {
                async next ( input : any ) : Promise<IteratorResult<R>> {
                    const { done, value } = await iterator.next( input );

                    if ( done ) {
                        return { done, value: void 0 };
                    }

                    iteratorSeed = await reducer( iteratorSeed, value );

                    return { done: false, value: iteratorSeed };
                },
                
                return ( input ?: any ) : Promise<IteratorResult<R>> {
                    if ( iterator.return ) {
                        return iterator.return( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<R>>;
                    } else {
                        return Promise.resolve( { done: true, value: input } );
                    }
                },
        
                throw ( input ?: any ) : Promise<IteratorResult<R>> {
                    if ( iterator.throw ) {
                        return iterator.throw( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<R>>;
                    } else {
                        return Promise.reject( input );
                    }
                }
            };
        }
    } );
}

export function scanSelf<T> ( iterable : AsyncIterableLike<T>, reducer : ( memo : T, item : T ) => T ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let hasSeed : boolean = false;
            let seed : T = null;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    const { done, value } = await iterator.next( input );

                    if ( done ) {
                        return { done, value: void 0 };
                    }

                    if ( hasSeed ) {
                        seed = reducer( seed, value );
                    } else {
                        hasSeed = true;
                        seed = value;

                        return this.next( input );
                    }

                    return { done, value: seed };
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
                        return iterator.throw( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<T>>;
                    } else {
                        return Promise.reject( input );
                    }
                }
            };
        }
    } );
}
