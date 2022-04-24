import { AsyncIterableLike, toAsyncIterator } from "../core";

export enum ObserverEndReason {
    End = 'end',
    Return = 'return'
}

export interface Observer<T> {
    onValue : ( value : T, index : number ) => Promise<any> | any;
    onEnd : ( reason : ObserverEndReason ) => Promise<any> | any;
    onError : ( error : any ) => Promise<any> | any;
}

export function observe<T> ( iterable : AsyncIterableLike<T>, observer : Partial<Observer<T>> ) : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            const iterator = toAsyncIterator( iterable );

            let hasEnded : boolean = false;

            let index = 0;

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input ?: any ) : Promise<IteratorResult<T>> {
                    try {
                        const { done, value } = await iterator.next( input );
            
                        if ( done && !hasEnded ) {
                            hasEnded = true;
                            
                            if ( observer.onEnd ) {
                                await observer.onEnd( ObserverEndReason.End );
                            }
                        } else if ( !done && observer.onValue ) {
                            await observer.onValue( value, index++ );
                        }
            
                        return { done, value };
                    } catch ( error ) {
                        if ( observer.onError ) {
                            await observer.onError( error );
                        }

                        throw error;
                    }
                },
                
                async return ( input ?: any ) : Promise<IteratorResult<T>> {
                    const result = iterator.return ? await iterator.return( input ) : { done: true, value: input };
        
                    if ( !hasEnded ) {
                        hasEnded = true;

                        if ( observer.onEnd ) {
                            observer.onEnd( ObserverEndReason.Return );
                        }
                    }

        
                    return result;
                },
        
                throw ( value ?: any ) : Promise<IteratorResult<T>> {
                    if ( iterator.throw ) {
                        return iterator.throw( value );
                    } else {
                        return Promise.reject( value );
                    }
                }
            };
        }
    }
}

export function logErrors<T> ( iterables : AsyncIterableLike<T>, label : string = 'iterable' ) : AsyncIterable<T> {
    const write = ( hasData : boolean, data ?: any ) => {
        console.log( `[${ label }] <error>`, hasData ? data : '' );
    };

    return observe( iterables, {
        onError ( error : any ) {
            write( true, error );
        }
    } );
}

export function log<T> ( iterables : AsyncIterableLike<T>, label : string = 'iterable' ) : AsyncIterable<T> {
    const write = ( kind : string, hasData : boolean, data ?: any ) => {
        console.log( `[${ label }] <${ kind }>`, hasData ? data : '' );
    };

    return observe( iterables, {
        onValue ( value : T ) {
            write( 'value', true, value );
        },
        onError ( error : any ) {
            write( 'error', true, error );
        },
        onEnd () {
            write( 'end', false );
        }
    } );
}