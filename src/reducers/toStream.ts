import { Readable } from "stream";
import { AsyncIterableLike, toAsyncIterator } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export class AsyncIterableReadable<T> extends Readable {
    iterator : AsyncIterator<T>;

    constructor ( iterator : AsyncIterator<T> ) {
        super();

        this.iterator = iterator;
    }

    _destroy ( err : any, cb : any ) {
        if ( err && this.iterator.throw ) {
            this.iterator.throw( err ).then( cb, cb );
        } else if ( !err && this.iterator.return ) {
            this.iterator.return( err ).then( cb, cb );
        }
    }

    _read () {
        this.iterator.next().then( ( { done, value } ) => {
            if ( done == true ) {
                this.push( null );

                return;
            }

            // Streams don't allow null values: they indicate the stream has ended
            // So if any of the values on the iterator is a null, we just discard it and read the next one
            if ( value === null ) {
                return this._read();
            }

            // If push returns true it means that it can still take more data, so we request it right away
            // otherwise we would wait fot _read to be called by the stream itself when needed
            if ( this.push( value ) ) {
                this._read();
            }
        } ).catch( err => {
            this.destroy( err );
        } );
    }
}

export function toStream<T> ( iterable : AsyncIterableLike<T>, cancel ?: CancelToken ) : NodeJS.ReadableStream {
    return new AsyncIterableReadable<T>( toAsyncIterator( cancellable( iterable, cancel ) ) );
}