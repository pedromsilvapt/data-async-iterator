import { Future } from '@pedromsilva/data-future';
import { resolve } from 'dns';

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
    public buffer : ReplayBuffer<T>;

    public source : AsyncIterator<T>;

    public nextValue : Future<IteratorResult<T>> = null;

    public isDone : boolean = false;

    constructor ( source : AsyncIterator<T>, bufferSize : number = Infinity ) {
        this.source = source;
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
        const result = await this.source.next();

        this.nextValue = null;

        if ( result.done ) {
            this.isDone = true;
        } else {
            this.buffer.add( result.value );
        }

        nextValue.resolve( result );

        return result;
    }

    [Symbol.asyncIterator] () : AsyncIterator<T> {
        let index : number = 0;

        const next = () : Promise<IteratorResult<T>> => {
            if ( index < this.buffer.first ) {
                index = this.buffer.first;
            }

            // If there are any left items in the buffer, just return them and increase our index to the next item
            if ( index < this.buffer.last ) {
                return Promise.resolve( { done: false, value: this.buffer.get( index++ ) } );
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

export function replay<T> ( source : AsyncIterator<T>, bufferSize : number = Infinity ) : AsyncIterable<T> {
    return new AsyncIterableReplay<T>( source, bufferSize );
}