import { AsyncIterableLike } from "../core";
import { emits } from "../generators/emits";
import { Semaphore } from "data-semaphore";
import { CancelToken } from "data-cancel-token";
import { forEach } from "../reducers/forEach";

export function buffered<T> ( iterable : AsyncIterableLike<T>, size : number ) : AsyncIterableIterator<T> {
    const emitter = emits<T>();

    const semaphore : Semaphore = new Semaphore( size );

    const cancel : CancelToken = new CancelToken();

    forEach( iterable, async value => {
        emitter.value( value );

        await semaphore.acquire();
    }, cancel ).then( () => {
        emitter.end();
    } ).catch( err => {
        emitter.exception( err );
    } );

    emitter.on( 'pull', () => {
        semaphore.release();
    } );

    emitter.on( 'return', () => {
        cancel.cancel();
    } );

    return emitter;
}