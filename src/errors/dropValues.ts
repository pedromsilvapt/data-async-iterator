import { AsyncIterableLike } from "../core";
import { filter } from "../transformers/filter";

export function dropValues ( iterable : AsyncIterableLike<any> ) : AsyncIterable<any> {
    return filter( iterable, () => false );
}