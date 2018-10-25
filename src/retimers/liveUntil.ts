import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function liveUntil<T> ( iterable : AsyncIterableLike<T>, promise : Promise<void> ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let ended = false;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    if ( ended ) {
                        if ( promise != null ) {
                            await promise;

                            promise = null;
                        }

                        return Promise.resolve( { done: true, value: void 0 } );
                    }

                    const { done, value } = await this.next();

                    if ( done ) {
                        ended = true;
                    }

                    return { done, value };
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