import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "../transformers/safe";

export function mapErrors<I> ( iterable : AsyncIterableLike<I>, mapper : ( err : any, index : number ) => I | Promise<I> | Promise<never>, keepErrors ?: false ) : AsyncIterable<I>;
export function mapErrors<I> ( iterable : AsyncIterableLike<I>, mapper : ( err : any, index : number ) => any | Promise<any> | Promise<never>, keepErrors : true | boolean ) : AsyncIterable<I>;
export function mapErrors<I> ( iterable : AsyncIterableLike<I>, mapper : ( err : any, index : number ) => I | Promise<I> | Promise<never>, keepErrors : boolean = false ) : AsyncIterable<I> {
    return safe( {
        [ Symbol.asyncIterator ] () : AsyncIterableIterator<I> {
            let index = 0;

            const iterator = toAsyncIterator( iterable );
            
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input : any ) : Promise<IteratorResult<I>> {
                    return iterator.next( input ).catch( err => {
                        if ( keepErrors ) {
                            return Promise.resolve( mapper( err, index++ ) ).then( value => Promise.reject( value ) );
                        } else {
                            return Promise.resolve( mapper( err, index++ ) ).then( value => ( {
                                done: false,
                                value: value
                            } ) );
                        }
                    } );
                },

                throw ( reason : any ) : Promise<IteratorResult<I>> {
                    if ( iterator.throw ) {
                        return iterator.throw( reason ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<I>>;
                    } else {
                        return Promise.reject( reason );
                    }
                },

                return ( value : any ) : Promise<IteratorResult<I>> {
                    if ( iterator.return ) {
                        return iterator.return( value ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<I>>
                    } else {
                        return Promise.resolve( { done: true, value } );
                    }
                }
            };
        }
    } );
}
