import { Readable } from "stream";
import { forEach } from "./forEach";
import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { from } from "../constructors/from";
import { cancellable } from "../transformers/cancellable";

export class AsyncIterableReadable<T> extends Readable {
    iterator : AsyncIterator<T>;

    constructor ( iterator : AsyncIterator<T> ) {
        super();

        this.iterator = iterator;
    }

    _destroy ( err : any, cb : any ) {
        this.iterator.throw( err ).then( cb, cb );
    }

    _read () {
        this.iterator.next().then( ( { done, value } ) => {
            if ( done == true ) {
                this.push( null );

                return;
            }

            if ( value === null ) {
                return this._read();
            }

            if ( this.push( value ) ) {
                this._read();
            }
        }, err => {
            this.destroy( err );
        } );
    }
}

export function toStream<T> ( iterable : AsyncIterableLike<T>, cancel ?: CancelToken ) : NodeJS.ReadableStream {
    return new AsyncIterableReadable<T>( cancellable( from( iterable ), cancel )[ Symbol.asyncIterator ]() );
}