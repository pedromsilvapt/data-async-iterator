import { Optional } from 'data-optional';

type AsyncIterableLikeAux<T> = AsyncIterable<T> | AsyncIterableIterator<T> | AsyncIterator<T> | Iterable<T>;

export type AsyncIterableLike<T> = AsyncIterableLikeAux<T> | Promise<AsyncIterableLikeAux<T>>;

export function isAsync<T> ( iterable : AsyncIterableLike<T> ) : iterable is ( AsyncIterable<T> | Promise<AsyncIterableLikeAux<T>> ) {
    if ( iterable && ( isAsyncIterable( iterable ) || iterable instanceof Promise ) ) {
        return true;
    }

    return false;
}

export function isAsyncIterable<T> ( iterable : AsyncIterableLike<T> ) : iterable is AsyncIterable<T> {
    if ( iterable && ( iterable as any )[ Symbol.asyncIterator ] ) {
        return true;
    }

    return false;
}

export function isAsyncIterator<T> ( iterable : any ) : iterable is AsyncIterator<T> {
    if ( iterable && typeof ( iterable as any ).next === 'function' ) {
        return true;
    }

    return false;
}

export function isSync<T> ( iterable : AsyncIterableLike<T> ) : iterable is Iterable<T> {
    if ( iterable && ( iterable as any )[ Symbol.iterator ] ) {
        return true;
    }

    return false;
}

export function isPromise<T> ( promise : any ) : promise is Promise<T> {
    return promise instanceof Promise;
}

export function from<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<T> {
    if ( isAsyncIterable( iterable ) ) {
        return iterable;
    } else if ( isAsyncIterator( iterable ) ) {
        return fromAsyncIterator( iterable );
    } else if ( iterable instanceof Promise ) {
        return fromIterablePromise( iterable );
    } else if ( isSync( iterable ) ) {
        return fromSync( iterable );
    } else {
        return fromPromise( iterable );
    }
}

export function fromIterablePromise<T> ( promise : Promise<AsyncIterableLikeAux<T>> ) : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            let error : Optional<any> = Optional.empty();

            let iterator : AsyncIterator<T> = null;

            const blocker = promise.then( iterable => iterator = from( iterable )[ Symbol.asyncIterator ](), err => error = Optional.of( err ) );

            return {
                next ( input ?: any ) : Promise<IteratorResult<T>> {
                    return blocker.then( () => {
                        if ( error.isPresent() ) {
                            const tmp = error.get();

                            error = Optional.empty();

                            return Promise.reject( tmp );
                        }

                        if ( iterator == null ) {
                            return { done: true, value: void 0 };
                        }

                        return iterator.next( input );
                    } );
                },

                throw ( reason ?: any ) : Promise<IteratorResult<T>> {
                    return blocker.then( () => {
                        if ( iterator != null && iterator.throw ) {
                            return iterator.throw( reason );
                        } else {
                            return Promise.reject( reason );
                        }
                    } );
                },

                return ( value ?: any ) : Promise<IteratorResult<T>> {
                    return blocker.then( () => {
                        if ( iterator != null && iterator.return ) {
                            return iterator.return( value );
                        } else {
                            return { done: true, value: value };
                        }
                    } );
                }
            }
        }
    };
}

export function fromAsyncIterator<T> ( iterator : AsyncIterator<T> ) : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            return iterator;
        }
    };
}

export function fromSync<T> ( iterable : Iterable<T> ) : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            const iterator = iterable[ Symbol.iterator ]();

            return {
                next ( input ?: any ) : Promise<IteratorResult<T>> {
                    try {
                        return Promise.resolve( iterator.next( input ) );
                    } catch ( error ) {
                        return Promise.reject( error );
                    }
                },

                throw ( reason ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator.throw ) {
                        return Promise.reject( iterator.throw( reason ) );
                    } else {
                        return Promise.reject( reason );
                    }
                },

                return ( value ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator.return ) {
                        return Promise.resolve( iterator.return( value ) );
                    } else {
                        return Promise.resolve( { done: true, value } );
                    }
                }
            }
        }
    };
}

export function fromPromise<T> ( promise : Promise<T> ) : AsyncIterable<T> {
    return {
        async * [ Symbol.asyncIterator ] () {
            yield await promise;
        }
    }
}


export function toAsyncIterable<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<T> {
    if ( isAsyncIterable( iterable ) ) {
        return iterable;
    }

    return from( iterable );
}

export function toAsyncIterator<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterator<T> {
    if ( isAsyncIterator( iterable ) ) {
        return iterable;
    }

    if ( isAsyncIterable( iterable ) ) {
        return iterable[ Symbol.asyncIterator ]();
    }

    return from( iterable )[ Symbol.asyncIterator ]();
}

export function toAsyncIterableIterator<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterableIterator<T> {
    if ( isAsyncIterable( iterable ) && isAsyncIterator( iterable ) ) {
        return iterable;
    }

    if ( !isAsyncIterable( iterable ) ) {
        iterable = from( iterable );
    }

    const iterator = toAsyncIterator( iterable );

    if ( isAsyncIterable( iterator ) ) {
        return iterator as AsyncIterableIterator<T>;
    }

    return {
        [ Symbol.asyncIterator ] () {
            return this;
        },

        next ( input ?: any ) : Promise<IteratorResult<T>> {
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
