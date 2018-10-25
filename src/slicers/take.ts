import { AsyncIterableLike, toAsyncIterator } from "../core";
import { slice } from "./slice";
import { empty } from "../generators/empty";
import { safe } from "../transformers/safe";

export function take<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterable<T> {
    if ( count == 0 ) {
        return empty<T>();
    }

    return safe( {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let remaining = count;

            let returned = false;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input ?: any ) : Promise<IteratorResult<T>> {
                    if ( remaining == 0 && !returned ) {
                        return this.return();
                    }

                    if ( remaining == 0 ) {
                        return Promise.resolve( { done: true, value: void 0 } );
                    }

                    return iterator.next( input ).then( result => {
                        remaining--;

                        return result;
                    } );
                },

                throw ( reason ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator.throw ) {
                        return iterator.throw( reason );
                    } else {
                        return Promise.reject( reason );
                    }
                },

                return ( value ?: any ) : Promise<IteratorResult<T>> {
                    returned = true;

                    if ( iterator.return )  {
                        return iterator.return( value );
                    } else {
                        return Promise.resolve( { done: true, value: value } );
                    }
                }
            };
        }
    } );
}

export function takeWhile<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let index = 0;
            
            let returned = false;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    const { done, value } = await iterator.next( input );

                    if ( done ) {
                        return { done: true, value: void 0 };
                    }

                    if ( !await predicate( value, index++ ) ) {
                        return this.return();
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
                    returned = true;
                    
                    if ( !returned && iterator.return ) {
                        return iterator.return( value );
                    } else {
                        return Promise.resolve( { done: true, value } );
                    }
                }
            };
        }
    } );
}

export function takeUntil<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterable<T> {
    return takeWhile( iterable, async ( item, index ) => !await predicate( item, index ) );
}

export function takeLast<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterable<T> {
    return slice( iterable, - count, Infinity );
}