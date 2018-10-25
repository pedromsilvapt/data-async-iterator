import { AsyncIterableLike } from "../core";
import { safe } from "../transformers/safe";
import { mapEither } from "../errors/mapEither";
import { Either } from "@pedromsilva/data-either";
import { throwIf } from "../errors/throwIf";
import { map } from "../transformers/map";
import { mapErrors } from "../errors/mapErrors";

class CircularBuffer<T> {
    protected buffer : Either<T, any>[] = [];

    capacity : number;

    protected bufferedErrors : number = 0;

    ready : Either<T, any>[] = [];

    protected autoReady : boolean;

    constructor ( capacity : number, autoReady : boolean = false ) {
        this.capacity = capacity;
        this.autoReady = autoReady;
    }

    add ( value : Either<T, any> ) {
        if ( value.isRight() ) {
            this.bufferedErrors += 1;
        }

        this.buffer.push( value );

        while ( this.buffer.length - this.bufferedErrors > this.capacity ) {
            const removed = this.buffer.shift();

            if ( removed.isRight() ) {
                this.bufferedErrors--;
            }

            if ( removed.isRight() || this.autoReady ) {
                this.ready.push( removed );
            }
        }
    }

    * slice ( start : number, end : number ) : Iterable<Either<T, any>> {
        let count = 0;

        for ( let item of this.ready ) yield item;

        for ( let item of this.buffer ) {
            if( item.isRight() || ( count >= start && count < end ) ) {
                yield item;
            }

            if ( item.isLeft() ) {
                count++;
            }
        }
    }
}

async function * sliceIterator<T> ( originalIterable : AsyncIterableLike<T>, start : number = 0, end : number = Infinity ) : AsyncIterableIterator<Either<T, any>> {
    const iterable = mapEither( originalIterable );

    if ( start < end && end < 0 ) {
        let startAbs = Math.abs( start );

        let buffer : CircularBuffer<T> = new CircularBuffer( startAbs );

        for await ( let item of iterable ) {
            buffer.add( item );

            if ( buffer.ready.length > 0 ) {
                yield * buffer.ready;

                buffer.ready = [];
            }
        }

        const length = Math.abs( start - end );

        if ( length > 0 ) yield * buffer.slice( 0, length );
    } else if ( start < 0 && end > 0 ) {
        // Even though end is a positive number, and thus we know we will never produce
        // any value with an index higher than that, we still need to buffer some values
        // For example, with the source sequence [ 1, 2, 3, 4 ], start = -2, end = 3
        // It should emite [ 3 ], but will have to request up to 4 and one more (end).
        // For start = -2, end = 2, the result is [], but we will still have to request up
        // to 4 (although we wont check if it ends, since end + startAbs = 4, that is our limit)

        const startAbs = Math.abs( start );

        let buffer : CircularBuffer<T> = new CircularBuffer( startAbs );

        let index : number = 0;

        for await ( let item of iterable ) {
            buffer.add( item );
            
            if ( item.isLeft() ) {
                index++;
            }
    
            if ( index - startAbs > end ) {
                break;
            }
        }

        const length = end - ( index - startAbs );

        if ( length > 0 ) yield * buffer.slice( 0, length );
    } else if ( start >= 0 && end < 0 ) {
        const endAbs = Math.abs( end );

        let buffer : CircularBuffer<T> = new CircularBuffer( endAbs, true );

        let index : number = 0;

        for await ( let item of iterable ) {
            if ( item.isLeft() && index < start ) {
                index++;

                continue;
            }

            buffer.add( item );

            if ( buffer.ready.length > 0 ) {
                yield * buffer.ready;

                buffer.ready = [];
            }
                        
            if ( item.isLeft() ) {
                index++;
            }
        }
    } else if ( start >= 0 && end > start ) {
        let index : number = 0;

        for await ( let item of iterable ) {
            if ( item.isRight() ) {
                yield item;
            } else {
                if ( index < start ) {
                    index++;
                    
                    continue;
                }
    
                if ( index >= end ) {
                    break;
                }
    
                yield item;
    
                index++;
            }
        }
    }
}

export function slice<T> ( iterable : AsyncIterableLike<T>, start : number = 0, end : number = Infinity ) : AsyncIterable<T> {
    return map( 
        mapErrors( 
            throwIf( 
                safe( {
                    [ Symbol.asyncIterator ] () {
                        return sliceIterator( iterable, start, end );
                    }
                } ), 
                v => v.isRight() 
            ), 
            v => v.getRight(), true 
        ), 
        v => v.getLeft() 
    );
}

