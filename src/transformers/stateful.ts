import { safe } from "./safe";
import { toAsyncIterator, AsyncIterableLike } from "../core";

export function stateful<T, S, U> ( iterable : AsyncIterableLike<T>, reducer : ( state : S, item : T ) => [S, U] | Promise<[S, U]>, seed : S ) : AsyncIterable<U> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            let iterator = toAsyncIterator( iterable );

            let iteratorSeed = seed;

            let reduced : U = null;
            
            return {
                async next ( input : any ) : Promise<IteratorResult<U>> {
                    const { done, value } = await iterator.next( input );

                    if ( done ) {
                        return { done, value: void 0 };
                    }

                    [ iteratorSeed, reduced ] = await reducer( iteratorSeed, value );

                    return { done: false, value: reduced };
                },
                
                return ( input ?: any ) : Promise<IteratorResult<U>> {
                    if ( iterator.return ) {
                        return iterator.return( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<U>>;
                    } else {
                        return Promise.resolve( { done: true, value: input } );
                    }
                },
        
                throw ( input ?: any ) : Promise<IteratorResult<U>> {
                    if ( iterator.throw ) {
                        return iterator.throw( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<U>>;
                    } else {
                        return Promise.reject( input );
                    }
                }
            };
        }
    } );
}
