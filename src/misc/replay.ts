import { Future } from '@pedromsilva/data-future';
import { Either } from '@pedromsilva/data-either';
import { toAsyncIterator, AsyncIterableLike } from '../core';

export class ReplayBuffer<T> {
    // Inclusive
    // When first == n, that means that the buffer contains the element n except
    // when first == last, in which case, the buffer is empty
    public first : number = 0;

    // Non-inclusive
    // When last == n, that means that the buffer only contains the element n - 1
    // When last == first, the buffer is empty
    public last : number = 0;

    public size : number;

    public data : T[] = [];

    constructor ( size : number ) {
        this.size = size;
    }

    add ( value : T ) {
        while ( this.last - this.first >= this.size ) {
            this.first++;

            this.data.shift();
        }

        this.data.push( value );

        this.last++;
    }

    get ( index : number ) : T {
        return this.data[ index - this.first ];
    }
}

export class AsyncIterableReplay<T> implements AsyncIterable<T> {
    public iterable : AsyncIterableLike<T>;

    protected iterator : AsyncIterator<T>;

    protected buffer : ReplayBuffer<Either<T, any>>;

    protected nextValue : Future<IteratorResult<T>> = null;

    protected isDone : boolean = false;

    constructor ( iterable : AsyncIterableLike<T>, bufferSize : number = Infinity ) {
        this.iterable = iterable;
        this.buffer = new ReplayBuffer( bufferSize );
    }

    async next () : Promise<IteratorResult<T>> {
        if ( this.nextValue != null ) {               
            return this.nextValue.promise;
        }

        const nextValue = this.nextValue = new Future();

        // Handle cases where source rejects the promise:
        //  - the buffer needs to be a sum type (Either<T, any>) to save both errors and values
        //  - the cleanup code should be in a finally, and there should be a catch to reject the future
        try {
            const result = await this.iterator.next();
        
            if ( result.done ) {
                this.isDone = true;
            } else {
                this.buffer.add( Either.left( result.value ) );
            }

            nextValue.resolve( result );
            
            return result;
        } catch ( error ) {
            this.buffer.add( Either.right( error ) );

            nextValue.reject( error );

            throw error;
        } finally {
            this.nextValue = null;
        }
    }

    [ Symbol.asyncIterator ] () : AsyncIterator<T> {
        if ( this.iterator == null ) {
            this.iterator = toAsyncIterator( this.iterable );
        }

        let index : number = 0;

        const next = () : Promise<IteratorResult<T>> => {
            if ( index < this.buffer.first ) {
                index = this.buffer.first;
            }

            // If there are any left items in the buffer, just return them and increase our index to the next item
            if ( index < this.buffer.last ) {
                return this.buffer.get( index++ ).reduce<Promise<IteratorResult<T>>>( 
                    value => Promise.resolve( { done: false, value } ),
                    error => Promise.reject( error )
                );
            } else {
                // If there is nothing for us in the buffer, we still want to increase the index
                // Otherwise when the next value comes, it is saved in the buffer for the other iterators
                // But this one (who requested it) would get it twice (from the buffer again, since the index wasn't changed)
                index++;

                if ( this.isDone ) {
                    return Promise.resolve( { done: true, value: null } );
                } else {
                    return this.next();
                }
            }
        };

        return { next };
    }
}

export function replay<T> ( source : AsyncIterableLike<T>, bufferSize : number = Infinity ) : AsyncIterable<T> {
    return new AsyncIterableReplay<T>( source, bufferSize );
}
