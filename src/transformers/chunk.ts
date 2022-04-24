import { AsyncIterableLike, toAsyncIterator } from "../core";
import { safe } from "./safe";
import { map } from './map';

export var sep = Symbol();
export var reset = Symbol();
export var backlog = Symbol();

export type ChunkSequence<T> = (T | symbol)[];

export function chunk<T, U> ( iterable : AsyncIterableLike<T>, fn : ( item : T, index : number, buffer : U[] ) => AsyncIterableLike<U | symbol>, autoFlush : boolean = true ) : AsyncIterable<U[]> {
    return safe( {
        [ Symbol.asyncIterator ] () {
            let index = 0;

            let iteratorDone = false;

            const iterator = toAsyncIterator( iterable );

            let commands : AsyncIterator<U | symbol>;
            
            // Each item can be partially chunked and then backlogged, which means it will be reintroduced into the sequence
            let backlogBuffer : T[] = [];
            // The buffer of items to be chunked together
            let buffer : U[] = [];

            return {
                [ Symbol.asyncIterator ] () {
                    return this;
                },

                async next ( input : any ) : Promise<IteratorResult<U[]>> {
                    while ( !iteratorDone ) {
                        // The interesting thing about this is since `fn` can return an iterator, we can lazily emit a chunk 
                        // and still have commands in that iterator left, so we don't need to consume the next item right away and
                        // should instead keep reading those commands
                        if ( commands == null ) {
                            const { done, value } = backlogBuffer.length > 0 
                                ? { done: false, value: backlogBuffer.pop() }
                                : await iterator.next( input );
    
                            if ( done ) {
                                iteratorDone = true;
                                
                                break;
                            }

                            commands = toAsyncIterator( fn( value, index, buffer ) );
                        }

                        while ( true ) {
                            const { done, value } = await commands.next();

                            if ( done ) {
                                commands = null;

                                break;
                            }

                            if ( typeof value === 'symbol' ) {
                                if ( value === sep ) {
                                    const bufferTemp = buffer;

                                    buffer =  [];

                                    return { done: false, value: bufferTemp };
                                } else if ( value === reset ) {
                                    buffer = [];
                                } else if ( value === backlog ) {
                                    const { done, value } = await commands.next();

                                    if ( done ) {
                                        throw new Error( `Command sequence cannot end after a backlog command.` );
                                    }

                                    backlogBuffer.push( value as any as T );
                                } else {
                                    buffer.push( value as any as U );
                                }
                            } else {
                                buffer.push( value );
                            }
                        }
                    }

                    // The while loop only ends when the main iterator reaches the end
                    // If autoFlush is true and our buffer is not empty, we should emit one last time
                    if ( autoFlush && buffer.length > 0 ) {
                        const bufferTemp = buffer;

                        buffer =  [];

                        return { done: false, value: bufferTemp };
                    }

                    return { done: true, value: void 0 };
                },
                
                return ( input ?: any ) : Promise<IteratorResult<U[]>> {
                    if ( iterator.return ) {
                        return iterator.return( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<U[]>>;
                    } else {
                        return Promise.resolve( { done: true, value: input } );
                    }
                },
        
                throw ( input ?: any ) : Promise<IteratorResult<U[]>> {
                    if ( iterator.throw ) {
                        return iterator.throw( input ) as Promise<IteratorResult<unknown>> as Promise<IteratorResult<U[]>>;
                    } else {
                        return Promise.reject( input );
                    }
                }
            };
        }
    } );
}

export function chunkEvery<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterable<T[]> {
    if ( count <= 0 ) {
        throw new Error( `Count should be bigger than zero.` );
    }

    return chunk( iterable, ( v, i, b ) => {
        if ( b.length == count - 1 ) {
            return [ v, sep ];
        } else {
            return [ v ];
        }
    } );
}

export function chunkUntil<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterable<T[]> {
    return chunk( iterable, ( item, i, b ) => {
        const result = predicate( item, i );

        if ( result instanceof Promise ) {
            return result.then( r => {
                if ( result ) {
                    return  [ item, sep ];
                } else {
                    return [ item ];
                }
            } );
        } else {
            if ( result ) {
                return  [ item, sep ];
            } else {
                return [ item ];
            }
        }
    } );
}

export function chunkWhile<T> ( iterable : AsyncIterableLike<T>, predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncIterable<T[]> {
    return chunkUntil( iterable, ( item, i ) => {
        const result = predicate( item, i );

        if ( result instanceof Promise ) {
            return result.then( r => !r );
        } else {
            return !result;
        }
    } );
}

export function chunkByLines ( iterable : AsyncIterableLike<string> ) : AsyncIterable<string> {
    return map( chunk( iterable, function * ( str ) {
        let start = 0;
        
        for ( let i = 0; i < str.length; i++ ) {
            if ( str[ i ] == '\n' ) {
                yield str.substring( start, i );
    
                yield sep;
    
                start = i + 1;
            }
        }
    
        if ( start < str.length ) {
            if ( start == 0 ) {
                yield str;
            } else {
                yield str.substr( start );
            }
        }
    } ), arr => arr.join( '' ) );
}


