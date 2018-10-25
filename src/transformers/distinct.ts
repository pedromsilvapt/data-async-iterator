import { reject } from "./filter";
import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "./safe";

export function distinct<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            const history : Set<T> = new Set<T>();

            return toAsyncIterator( reject( iterable, item => {
                if ( history.has( item ) ) {
                    return true;
                }
                
                history.add( item );
                
                return false;
            } ) );
        }
    } );
}

export function distinctUntilChanged<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            let has : boolean = false;
            let lastValue : T = null;
            let isDuplicate = false;
            let iterator = toAsyncIterator( iterable );

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input : any ) : Promise<IteratorResult<T>> {
                    const { done, value } = await iterator.next( input );

                    if ( done ) {
                        return { done, value };
                    }

                    isDuplicate = !has || lastValue !== value;

                    has = true;
                    lastValue = value;

                    if ( !isDuplicate ) {
                        return { done: false, value };
                    } else {
                        return this.next( input );
                    }
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
            }
        }
    } );
}