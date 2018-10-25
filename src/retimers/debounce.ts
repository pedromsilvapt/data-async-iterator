import { AsyncIterableLike, toAsyncIterator } from "../core";
import { Future } from "@pedromsilva/data-future";
import { safe } from "../transformers/safe";

export function debounce<T> ( iterable : AsyncIterableLike<T>, interval : number ) : AsyncIterable<T> {
    return safe<T>( {
        [ Symbol.asyncIterator ] () {
            let delayedTimeout : NodeJS.Timer;

            let delayed : Future<IteratorResult<T>>;

            const iterator = toAsyncIterator( iterable );

            let lastValue : Promise<IteratorResult<T>>;

            let ended = false;

            const send = async ( res : Promise<IteratorResult<T>> ) : Promise<IteratorResult<T>> => {
                const { done, value } = await res;

                if ( done ) {
                    ended = true;
                } else {
                    wait();
                }

                return { done, value };
            }

            const wait = () => {
                delayed = new Future<IteratorResult<T>>();

                delayedTimeout = setTimeout( () => {
                    delayedTimeout = null;

                    if ( lastValue ) {
                        delayed.resolve( lastValue );

                        lastValue = null;

                        delayed = null;
                    }
                }, interval );
            };

            const pull = async () : Promise<void> => {
                const promise = iterator.next();

                const { done, value } = await promise;

                if ( done ) {
                    ended = true;
                }

                if ( !lastValue || !done ) {
                    lastValue = promise;
                }

                if ( !delayedTimeout && delayed ) {
                    delayed.resolve( lastValue );

                    lastValue = null;

                    delayed = null;
                } else if ( !ended ) {
                    return pull();
                }
            };

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    if ( ended ) {
                        return { done: true, value: null };
                    }

                    if ( delayedTimeout ) {
                        pull().catch( error => console.error( error.message, error.stack ) );

                        return send( delayed.promise );
                    };

                    if ( lastValue ) {
                        const result = lastValue;

                        lastValue = null;

                        return send( result );
                    }
            
                    return send( iterator.next( input ) );
                },

                return ( input ?: any ) {
                    if ( delayedTimeout ) {
                        clearTimeout( delayedTimeout );

                        delayedTimeout = null;

                        lastValue = null;
                    }

                    return iterator.return( input );
                }
            };
        }
    } );
}