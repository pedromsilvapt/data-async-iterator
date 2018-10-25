import { subject } from "../generators/subject";
import { Either } from "@pedromsilva/data-either";

export function fromPromises <T> ( promises : Promise<T>[], sequential : boolean = false ) : AsyncIterableIterator<T> {
    const emitter = subject<T>();

    // Counts how many promises are still unresolved. Useful to know when to end the emitter,
    // especially when emitting non sequentially (in parallel)
    let missing = 0;

    const iterator : Iterator<Promise<Either<T, any>>> = promises.map( value => {
        return value
            .then( value => Either.left<T, any>( value ) )
            .catch( error => Either.right<T, any>( error ) );
    } )[ Symbol.iterator ]();

    const push = ( value : Either<T, any> ) => {
        emitter.push( value );

        missing--;

        if ( !sequential && missing == 0 ) {
            emitter.end();
        }

        if ( sequential ) {
            next();
        }
    };

    const next = () => {
        try {
            const { done, value } = iterator.next();

            if ( !done ) {
                missing++;

                value.then( value => push( value ) )

                // If not sequential, we don't need to wait for the current promise to resolve
                // to listen to the next one, so we just call next right away
                if ( !sequential ) next();
            } else {
                // When sequential (next is only called when the last promise resolved)
                // if the iterator is "done" also means all the other previous promises
                // already resolved, so we can end the emitter
                if ( sequential ) {
                    emitter.end();
                }
            }
        } catch ( error ) {
            emitter.pushException( error );

            next();
        }
    };

    next();

    if ( missing == 0 ) {
        emitter.end();
    }

    return emitter;
}