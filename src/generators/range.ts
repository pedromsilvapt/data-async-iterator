export function range ( start : number = 0, end : number = Infinity, step : number = 1 ) : AsyncIterable<number> {
    return {
        [ Symbol.asyncIterator ] () {
            return rangeIterator( start, end, step );
        }
    }
}

async function * rangeIterator ( start : number = 0, end : number = Infinity, step : number = 1 ) : AsyncIterableIterator<number> {
    if ( start <= end ) {
        for ( let i = start; i < end; i += step ) {
            yield i;
        }
    } else {
        for ( let i = start; i > end; i -= step ) {
            yield i;
        }
    }
}