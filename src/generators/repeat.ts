export async function * repeat<T> ( value : T ) : AsyncIterableIterator<T> {
    while ( true ) {
        yield value;
    }
}