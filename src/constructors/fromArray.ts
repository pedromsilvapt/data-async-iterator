export async function * fromArray<T> ( array : T[] | Promise<T[]> ) : AsyncIterableIterator<T> {
    array = await array;

    yield * array;
}