import { AsyncIterableLike } from '../core';
import { AsyncStream } from '../asyncStream';
import { empty } from '../generators/empty';

export enum PaginationMethod {
    Page, Offset
}

export function paginate<T> ( supplier : ( page : number ) => AsyncIterableLike<T>, method : PaginationMethod = PaginationMethod.Page, start : number = 0 ) {
    return AsyncStream.dynamic( () => {
        const state = { started : false, cursor: start, counted: 0, ended: false };

        return AsyncStream.repeat( null )
            .takeUntil( () => state.ended )
            .flatMap( () => {
                if ( state.started && state.counted == 0 ) {
                    state.ended = true;

                    return empty<T>();
                }

                if ( state.started ) {
                    if ( method == PaginationMethod.Page ) state.cursor += 1;
                    else if ( method == PaginationMethod.Offset ) state.cursor += state.counted;
                    
                    state.counted = 0;
                }

                state.started = true;

                return supplier( state.cursor );
            } ).tap( () => state.counted += 1 );
    } );
}