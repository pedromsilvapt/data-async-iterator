import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export type ErrorMatcher = ( item : any, index : number, contiguousIndex : number ) => boolean | Promise<boolean> | Promise<never>;

export function takeUntilErrors<T> ( iterable : AsyncIterableLike<T>, predicate : ErrorMatcher, count ?: number, contiguous ?: boolean ) : AsyncIterable<T>;
export function takeUntilErrors<T> ( iterable : AsyncIterableLike<T>, count ?: number, contiguous ?: boolean ) : AsyncIterable<T>;
export function takeUntilErrors<T> ( iterable : AsyncIterableLike<T>, predicate : ErrorMatcher | number = null, count : number | boolean = 1, contiguous : boolean = false ) : AsyncIterable<T> {
    if ( typeof predicate === 'number' ) {
        if ( typeof count === 'boolean' ) {
            contiguous = count as boolean;
        }

        count = predicate as number;
        
        predicate = null;
    }

    const _predicate : ErrorMatcher = predicate as any;
    const _count : number = count as any;
    const _contiguous = contiguous as boolean;

    return safe( {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let index = 0;
            let contiguousIndex = 0;
            
            let returned = false;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    try {
                        if ( returned ) {
                            return { done: true, value: void 0 };
                        }

                        const { done, value } = await iterator.next( input );

                        if ( _contiguous ) contiguousIndex = 0;
                        
                        if ( done ) {
                            return { done: true, value: void 0 };
                        }

                        return { done, value };
                    } catch ( error ) {
                        if ( !_predicate || !await _predicate( error, index, contiguousIndex ) ) {
                            contiguousIndex++;

                            if ( contiguousIndex >= _count ) {
                                await this.return();
                            }
                        } else if ( _contiguous ) {
                            contiguousIndex = 0;
                        }

                        index++;

                        throw error;
                    }
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
