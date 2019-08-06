import { AsyncIterableLike, toAsyncIterator } from "../core";
import { slice } from "./slice";
import { safe } from "../transformers/safe";

export function drop<T> ( iterable : AsyncIterableLike<T>, count : number, countErrors : boolean = false ) : AsyncIterable<T> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let remaining = count;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input : any ) : Promise<IteratorResult<T>> {
                    while ( remaining > 0 ) {
                        try {
                            const { done } = await iterator.next( input );
    
                            if ( done ) {
                                return { done: true, value: void 0 };
                            }

                            remaining--;
                        } catch ( err ) {
                            if ( countErrors ) {
                                remaining--;
                            } else {
                                throw err;
                            }
                        }
                    }

                    return iterator.next( input );
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
            }
        }
    } );
}

export type DropPredicate<T> = ( item : T, index : number ) => boolean | Promise<boolean>;

export function dropWhile<T> ( iterable : AsyncIterableLike<T>, predicate : DropPredicate<T> ) : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );
            
            let switched : boolean = false;
            
            let index = 0;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    while ( !switched ) {
                        const { done, value } = await iterator.next( input );

                        if ( done ) {
                            return { done: true, value: void 0 };
                        }

                        switched = !await predicate( value, index++ );

                        if ( switched ) {
                            return { done, value };
                        }
                    }

                    return iterator.next( input );
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
            }
        }
    };
}

export function dropUntil<T> ( iterable : AsyncIterableLike<T>, predicate : DropPredicate<T> | Promise<unknown> ) : AsyncIterable<T> {
    if ( predicate instanceof Promise ) {
        let resolved = false;

        // TODO drop should break eraly when the promise resolves, instead of possibly
        // waiting for the source iterator to return before checking the promise state
        if ( predicate instanceof Promise ) {
            predicate.then( () => resolved = true, () => resolved = true );
        }

        return dropWhile( iterable, async () => !resolved );
    } else {
        return dropWhile( iterable, async ( item, index ) => !await predicate( item, index ) );
    }
}

export function dropLast<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterable<T> {
    return slice( iterable, 0, - count );
}