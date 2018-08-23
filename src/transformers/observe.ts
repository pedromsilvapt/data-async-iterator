import { AsyncIterableLike } from "../core";
import { from } from "../constructors/from";

export enum ObserverEndReason {
    End = 'end',
    Return = 'return'
}

export interface Observer<T> {
    onValue : ( value : T ) => any;
    onEnd : ( reason : ObserverEndReason ) => any;
    onError : ( error : any ) => any;
}

export function observe<T> ( iterable : AsyncIterableLike<T>, observer : Partial<Observer<T>> ) : AsyncIterableIterator<T> {
    const iterator = from( iterable )[ Symbol.asyncIterator ]();

    let hasEnded : boolean = false;

    return {
        [ Symbol.asyncIterator ] () {
            return this;
        },
        async next ( input ?: any ) : Promise<IteratorResult<T>> {
            const { done, value } = await iterator.next( input );

            if ( done && observer.onEnd && !hasEnded ) {
                hasEnded = true;

                observer.onEnd( ObserverEndReason.End );
            } else if ( !done && observer.onValue ) {
                observer.onValue( value );
            }

            return { done, value };
        },
        
        async return ( input ?: any ) : Promise<IteratorResult<T>> {
            const result = iterator.return ? await iterator.return() : { done: true, value: null };

            if ( !hasEnded && observer.onEnd ) {
                hasEnded = true;
                observer.onEnd( ObserverEndReason.Return );
            }

            return result;
        },

        async throw ( value ?: any ) : Promise<IteratorResult<T>> {
            return iterator.throw ? iterator.throw( value ) : { done: true, value: null };
        }
    }
}

export function log<T> ( iterables : AsyncIterableLike<T>, label : string = 'iterable' ) : AsyncIterableIterator<T> {
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