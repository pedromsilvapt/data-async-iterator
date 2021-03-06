import { AsyncIterableLike } from "../core";
import { subject } from "../generators/subject";
import { Semaphore } from "data-semaphore";
import { CancelToken } from "data-cancel-token";
import { forEach } from "../reducers/forEach";
import { cancellable } from "./cancellable";

export function buffered<T> ( iterable : AsyncIterableLike<T>, size : number ) : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            const emitter = subject<T>();

            const semaphore : Semaphore = new Semaphore( size );

            const cancel : CancelToken = new CancelToken();

            forEach( cancellable( iterable, cancel ), async value => {
                emitter.pushValue( value );

                await semaphore.acquire();
            } ).then( () => {
                emitter.end();
            } ).catch( err => {
                emitter.pushException( err );
            } );

            emitter.on( 'pull', () => {
                semaphore.release();
            } );

            emitter.on( 'returned', () => {
                cancel.cancel();
            } );

            return emitter;
        }
    };
}