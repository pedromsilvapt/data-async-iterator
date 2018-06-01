export async function * range ( start : number = 0, end : number = Infinity ) : AsyncIterableIterator<number> {
    for ( let i = start; i < end; i++ ) {
        yield i;
    }
}