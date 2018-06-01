import { AsyncIterableLike } from "../core";
import { cancellable } from "../transformers/cancellable";
import { CancelToken } from "data-cancel-token";

export async function every<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean>, cancel ?: CancelToken ) : Promise<boolean> {
    let result : boolean | Promise<boolean>;

    let index = 0;

    for await ( let item of cancellable( iterable, cancel ) ) {
        result = predicate( item, index );

        if ( result instanceof Promise ) {
            if ( !await result ) {
                return false;
            }
        } else {
            if ( !result ) {
                return false;
            }
        }

        index++;
    }

    return true;
}