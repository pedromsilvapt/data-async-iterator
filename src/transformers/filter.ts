import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "./safe";

export function filter<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> | Promise<never> ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            let index = 0;

            const iterator = toAsyncIterator( iterable );
            
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input : any ) : Promise<IteratorResult<T>> {
                    return iterator.next( input ).then( result => {
                        if ( result.done ) {
                            return result;
                        }
                        
                        return Promise.resolve( predicate( result.value, index++ ) ).then( value => {
                            if ( !value ) return this.next( input );

                            return result;
                        } );
                    } );
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

export function reject<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterable<T> {
    return filter( iterable, ( item, index ) => {
        let result : boolean | Promise<boolean> = predicate( item, index );
        
        if ( result instanceof Promise ) {
            return result.then( value => !value );
        }

        return !result;
    } );
}