import { AsyncIterableLike } from "../core";
import { Observer, observe } from "../transformers/observe";
import { drain } from "./drain";
import { CancelToken } from "data-cancel-token";

export function consume<T> ( iterable : AsyncIterableLike<T>, observer : Partial<Observer<T>>, cancel ?: CancelToken, ignoreErrors : boolean = false ) : Promise<void> {
    return drain( observe( iterable, observer ), cancel, ignoreErrors );
}