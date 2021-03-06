import { AsyncIterableLike, toAsyncIterator } from "../core";

// For await isn't nice to errors
// Also, generators return AsyncIetrableIterators instead of AsyncIterables only
export function map<I, O> ( iterable : AsyncIterableLike<I>, mapper : ( item : I, index : number ) => O | Promise<O> | Promise<never>, resolve ?: true ) : AsyncIterable<O>;
export function map<I, O> ( iterable : AsyncIterableLike<I>, mapper : ( item : I, index : number ) => O, resolve : boolean ) : AsyncIterable<O>;
export function map<I, O> ( iterable : AsyncIterableLike<I>, mapper : ( item : I, index : number ) => O | Promise<O> | Promise<never>, resolve : boolean = true ) : AsyncIterable<O> {
    return {
        [ Symbol.asyncIterator ] () : AsyncIterableIterator<O> {
            let index = 0;

            const iterator = toAsyncIterator( iterable );
            
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input : any ) : Promise<IteratorResult<O>> {
                    return iterator.next( input ).then( result => {
                        if ( result.done ) {
                            return result as unknown as IteratorResult<O>;
                        }
                        
                        if ( resolve ) {
                            return Promise.resolve( mapper( result.value, index++ ) ).then( value => ( {
                                done: false,
                                value: value
                            } ) );
                        } else {
                            return { done: false, value: mapper( result.value, index++ ) as any };
                        }
                    } );
                },

                throw ( reason : any ) : Promise<IteratorResult<O>> {
                    if ( iterator.throw ) {
                        return iterator.throw( reason ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<O>>;
                    } else {
                        return Promise.reject( reason );
                    }
                },

                return ( value : any ) : Promise<IteratorResult<O>> {
                    if ( iterator.return ) {
                        return iterator.return( value ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<O>>
                    } else {
                        return Promise.resolve( { done: true, value } );
                    }
                }
            };
        }
    };
}