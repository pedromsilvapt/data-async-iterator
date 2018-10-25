// Wraps an iterator into another, but does not propagate the return method - the one that tells
// when an iterator should close and destroy resources
export function partial<T> ( iter : AsyncIterator<T> ) : AsyncIterableIterator<T> {
    let returned : boolean = false;

    return {
        [ Symbol.asyncIterator ] () {
            return this;
        },

        next ( value : any ) : Promise<IteratorResult<T>> {
            if ( returned ) {
                return Promise.resolve( { done: true, value: void 0 } );
            }

            return iter.next( value );
        },

        return ( value : any ) : Promise<IteratorResult<T>> {
            returned = true;

            return Promise.resolve( { done: true, value: value } );
        },

        throw ( err : any ) : Promise<IteratorResult<T>> {
            if ( iter.throw ) {
                return iter.throw( err );
            } else {
                return Promise.reject( err );
            }
        }
    }
}
