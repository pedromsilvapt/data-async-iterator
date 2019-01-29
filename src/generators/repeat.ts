import { dynamic } from '../constructors/dynamic';

export function repeat<T = void> ( value : T = void 0, count : number = Infinity ) : AsyncIterable<T> {
    return dynamic( async function * () {
        for ( let i = 0; i < count; i++ ) {
            yield value;
        }
    } );
}

export function single<T> ( value : T ) : AsyncIterable<T> {
    return repeat( value, 1 );
}