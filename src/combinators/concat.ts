import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function concat<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            const mainIterator = toAsyncIterator( iterables );

            let iterator : AsyncIterator<T> = null;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator == null ) {
                        const { done, value } = await mainIterator.next( input );

                        if ( done ) {
                            return Promise.resolve( { done: true, value: void 0 } );
                        }

                        iterator = toAsyncIterator( value );
                    }

                    const { done, value } = await iterator.next( input );

                    if ( done ) {
                        iterator = null;

                        return this.next( input );
                    }

                    return Promise.resolve( { done: false, value } );
                },

                throw ( reason ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator && iterator.throw ) {
                        return iterator.throw( reason );
                    } else if ( mainIterator.throw ) {
                        return mainIterator.throw( reason ) as Promise<IteratorResult<any>>;
                    } else {
                        return Promise.reject( reason );
                    }
                },

                async return ( value ?: any ) : Promise<IteratorResult<T>> {
                    await mainIterator.return( value );

                    if ( iterator && iterator.return ) {
                        return iterator.return( value );
                    } else {
                        return { done: true, value };
                    }
                }
            };
        }
    } );
}