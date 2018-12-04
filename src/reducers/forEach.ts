import { AsyncIterableLike } from "../core";
import { consume } from "./consume";

export async function forEach<T> ( iterable : AsyncIterableLike<T>, action : ( item : T ) => any | Promise<any>, onError ?: ( ( error : any ) => any | Promise<any> ) ) : Promise<void> {
    return consume( iterable, {
        onValue: action,
        onError: onError as any
    } );
}