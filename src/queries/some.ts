import { AsyncIterableLike } from "../core";
import { CancelToken } from "data-cancel-token";
import { cancellable } from "../transformers/cancellable";

export async function some<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean>, cancel ?: CancelToken ) : Promise<boolean> {
    let result : boolean | Promise<boolean>;

    let index = 0;

    for await ( let item of cancellable( iterable, cancel ) ) {
        result = predicate( item, index );

        if ( result instanceof Promise ) {
            if ( await result ) {
                return true;
            }
        } else {
            if ( result ) {
                return true;
            }
        }

        index++;
    }

    return false;
}