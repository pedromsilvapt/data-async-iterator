import { AsyncIterableLike, toAsyncIterator } from "../core";

export async function drain ( iterable : AsyncIterableLike<any>, ignoreErrors : boolean = false ) : Promise<void> {
    const iterator = toAsyncIterator( iterable );

    while ( true ) {
        try {
            const { done } = await iterator.next();

            if ( done ) {
                break;
            }
        } catch ( error ) {
            if ( !ignoreErrors ) {
                await iterator.return();

                throw error;
            }
        }
    }
}