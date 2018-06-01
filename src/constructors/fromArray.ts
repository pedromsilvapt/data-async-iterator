export function fromArray<T> ( array : T[] ) : AsyncIterableIterator<T>;
export function fromArray<T> ( array : Promise<T[]> ) : AsyncIterableIterator<T>;
export async function * fromArray<T> ( array : T[] | Promise<T[]> ) : AsyncIterableIterator<T> {
    array = await array;

    yield * array;
}