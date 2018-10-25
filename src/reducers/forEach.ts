import { AsyncIterableLike } from "../core";
import { CancelToken } from 'data-cancel-token';
import { consume } from "./consume";

export async function forEach<T> ( iterable : AsyncIterableLike<T>, action : ( item : T ) => any | Promise<any>, cancel ?: CancelToken ) : Promise<void>;
export async function forEach<T> ( iterable : AsyncIterableLike<T>, action : ( item : T ) => any | Promise<any>, onError : ( ( error : any ) => any | Promise<any> ), cancel ?: CancelToken ) : Promise<void>;
export async function forEach<T> ( iterable : AsyncIterableLike<T>, action : ( item : T ) => any | Promise<any>, onError ?: ( ( error : any ) => any | Promise<any> ) | CancelToken, cancel ?: CancelToken ) : Promise<void> {
    if ( onError instanceof CancelToken ) {
        cancel = onError;
        onError = null;
    }

    return consume( iterable, {
        onValue: action,
        onError: onError as any
    }, cancel );
}