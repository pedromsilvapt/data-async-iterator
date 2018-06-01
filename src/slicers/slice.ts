import { AsyncIterableLike } from "../core";
import { from } from "../constructors/from";

export async function * slice<T> ( iterable : AsyncIterableLike<T>, start : number = 0, end : number = Infinity ) : AsyncIterableIterator<T> {
    let index = 0;
    
    if ( start < end && end < 0 ) {
        let buffer : T[] = [];

        let startAbs = Math.abs( start );

        for await ( let item of from( iterable ) ) {
            buffer.push( item );
            
            if ( buffer.length > startAbs ) {
                buffer.shift();
            }
        }

        const length = Math.abs( start - end );

        if ( length > 0 ) {
            for ( let item of buffer.slice( 0, length ) ) yield item;
        }
    } else if ( start < 0 && end >= 0 ) {
        let buffer : T[] = [];

        let index : number = 0;

        const startAbs = Math.abs( start );

        for await ( let item of from( iterable ) ) {
            buffer.push( item );
            
            if ( buffer.length > startAbs ) {
                buffer.shift();
            }

            index++;

            if ( index - startAbs > end ) {
                break;
            }
        }

        const length = end - ( index - startAbs );

        if ( length > 0 ) {
            for ( let item of buffer.slice( 0, length ) ) yield item;
        }
    } else if ( start >= 0 && end < 0 ) {
        let buffer : T[] = [];

        let index : number = 0;

        const endAbs = Math.abs( end );

        for await ( let item of from( iterable ) ) {
            if ( index < start ) {
                index++;
                
                continue;
            }

            buffer.push( item );
            
            if ( buffer.length > endAbs ) {
                yield buffer.shift();
            }
            
            index++;            
        }
    } else if ( start >= 0 && end > start ) {
        let index : number = 0;

        for await ( let item of from( iterable ) ) {
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