import { AsyncIterableLike, toAsyncIterable } from "../core";
import { Collector } from 'data-collectors';

export async function collect<T, R> ( iterable : AsyncIterableLike<T>, collector : Collector<T, any, R> ) : Promise<R> {
    const container = collector.supply();

    for await ( let item of toAsyncIterable( iterable ) ) {
        collector.accumulate( container, item );
    }

    return collector.finish( container );
}