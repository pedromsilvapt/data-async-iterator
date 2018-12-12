import { AsyncIterableLike, toAsyncIterableIterator, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function dynamic<T> ( factory : () => AsyncIterableLike<T>, lazy : boolean = false ) {
    return safe( {
        [ Symbol.asyncIterator ] () {
            if ( !lazy ) {
                return toAsyncIterableIterator( factory() );
            } else {
                let iterator : AsyncIterator<T> = null;

                return {
                    [ Symbol.asyncIterator ] () {
                        return this;
                    },

                    next ( input : any ) : Promise<IteratorResult<T>> {
                        if ( iterator == null ) {
                            iterator = toAsyncIterator( factory() );
                        }

                        return iterator.next( input );
                    },

                    throw ( reason ?: any ) : Promise<IteratorResult<T>> {
                        if ( iterator != null && iterator.throw ) {
                            return iterator.throw( reason );
                        } else {
                            return Promise.reject( reason );
                        }
                    },

                    return ( value ?: any ) : Promise<IteratorResult<T>> {
                        if ( iterator != null && iterator.return ) {
                            return iterator.return( value );
                        } else {
                            return Promise.resolve( { done: true, value } );
                        }
                    }
                }
            }
        }
    } );
}
