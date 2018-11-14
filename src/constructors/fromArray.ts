import { safe } from "../transformers/safe";

export function fromArray<T> ( array : T[] | Promise<T[]> ) : AsyncIterable<T> {
    return safe( {
        async * [Symbol.asyncIterator] () {
            array = await array;

            yield * array;
        }
    } );
}
