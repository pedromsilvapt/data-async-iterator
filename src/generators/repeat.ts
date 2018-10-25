export async function * repeat<T> ( value : T, count : number = Infinity ) : AsyncIterableIterator<T> {
    for ( let i = 0; i < count; i++ ) {
        yield value;
    }
}