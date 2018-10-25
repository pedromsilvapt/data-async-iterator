export function empty<T> () : AsyncIterable<T> {
    return {
        [ Symbol.asyncIterator ] () {
            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                next ( input ?: any ) : Promise<IteratorResult<T>> {
                    return Promise.resolve( { done: true, value: void 0 } );
                }, 

                throw ( reason ?: any ) : Promise<IteratorResult<T>> {
                    return Promise.reject( reason );
                },

                return ( value ?: any ) : Promise<IteratorResult<T>> {
                    return Promise.resolve( { done: true, value } );
                }
            }
        }
    }
}