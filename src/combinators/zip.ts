import { AsyncIterableLike, isSync } from "../core";
import { Barrier, synchronize } from "../retimers/synchronize";
import { from } from "../constructors/from";
import { SemaphoreLike } from "data-semaphore";
import { forEach } from "../reducers/forEach";
import { emits } from "../generators/emits";
import { map } from "../transformers/map";
import { merge } from "./merge";
import { observe, Observer } from "../transformers/observe";
import { describe, IterablePackage } from "../transformers/describe";
import { filter } from "../transformers/filter";

export type AIL<T> = AsyncIterableLike<T>;

export enum ZipMode {
    SampledUntilFirstEnds = 'sampledUntilFirstEnds',
    SampledUntilLastEnds = 'sampledUntilLastEnds',
    UntilFirstEnds = 'untilFirstEnds',
    UntilLastEnd = 'untilLastEnds'
}

export function zip<T> ( items : AIL<AIL<T>>, mode ?: ZipMode ) : AsyncIterableIterator<T[]>;
export function zip<T1, T2> ( items : [AIL<T1>, AIL<T2>], mode ?: ZipMode ) : AsyncIterableIterator<[T1, T2]>;
export function zip<T1, T2, T3> ( items : [AIL<T1>, AIL<T2>, AIL<T3>], mode ?: ZipMode ) : AsyncIterableIterator<[T1, T2, T3]>;
export function zip<T1, T2, T3, T4> ( items : [AIL<T1>, AIL<T2>, AIL<T3>, AIL<T4>], mode ?: ZipMode ) : AsyncIterableIterator<[T1, T2, T3, T4]>;
export function zip<T1, T2, T3, T4, T5> ( items : [AIL<T1>, AIL<T2>, AIL<T3>, AIL<T4>, AIL<T5>], mode ?: ZipMode ) : AsyncIterableIterator<[T1, T2, T3, T4, T5]>;
export function zip<T1, T2, T3, T4, T5, T6> ( items : [AIL<T1>, AIL<T2>, AIL<T3>, AIL<T4>, AIL<T5>, AIL<T6>], mode ?: ZipMode ) : AsyncIterableIterator<[T1, T2, T3, T4, T5, T6]>;
export function zip<T> ( items : AsyncIterableLike<AsyncIterableLike<T>>, mode : ZipMode = ZipMode.UntilLastEnd ) : AsyncIterableIterator<T[]> {
    const iterators : Map<AsyncIterator<T>, number> = new Map();

    const values : T[] = [];

    const tag = <R, T>( t : R ) => ( item : T ) => [ t, item ] as [R, T];
    
    const observer = ( it : AsyncIterableIterator<T> ) : Partial<Observer<T>> => ( {
        onEnd () {
            iterators.delete( it );
        }
    } );

    // A list of 
    const taggedItems : AsyncIterableIterator<[AsyncIterableIterator<T>, IterablePackage<T>]> = 
        merge( map( synchronize( items ), it => map( describe( it ), tag( it ) ) ) );

    let newValues : 0 = 0;

    return filter( map( taggedItems, ( [ iter, item ] ) => {
        if ( !iterators.has( iter ) ) {
            iterators.set( iter, values.length );

            values.push( null );
        }
        
        if ( item.event == 'value' ) {
            const index = iterators.get( iter );

            const result = Array.from( values );            

            result[ index ] = item.value;

            newValues++;

            if ( newValues === iterators.size ) {
                newValues = 0;

                return result;
            } else if ( mode == ZipMode.SampledUntilFirstEnds || mode == ZipMode.SampledUntilLastEnds ) {
                return result;
            }
        } else if ( item.event == 'error' ) {
            throw item.error;
        } else {
            iterators.delete( iter );

            return null;
        }
    } ), item => !!item );
}