import { AsyncIterableLike } from "../core";
import { Observer, observe } from "../transformers/observe";
import { drain } from "./drain";

export function consume<T> ( iterable : AsyncIterableLike<T>, observer : Partial<Observer<T>>, ignoreErrors : boolean = false ) : Promise<void> {
    return drain( observe( iterable, observer ), ignoreErrors );
}