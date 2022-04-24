import { CancelToken } from "data-cancel-token";
import { Optional } from "data-optional";
import { Either } from "@pedromsilva/data-either";
import { SemaphoreLike } from "data-semaphore";

import { AsyncIterableLike, toAsyncIterable, toAsyncIterator, toAsyncIterableIterator, fromPromise } from "./core";

import { map } from "./transformers/map";
import { filter, reject } from "./transformers/filter";
import { distinct, distinctUntilChanged } from "./transformers/distinct";
import { IterablePackage, describe } from "./transformers/describe";
import { cancellable } from "./transformers/cancellable";
import { chunk, chunkByLines, chunkEvery, chunkUntil, chunkWhile } from "./transformers/chunk";
import { buffered } from "./transformers/buffered";
import { Observer, observe, log, logErrors } from "./transformers/observe";
import { scan, scanSelf } from "./transformers/scan";
import { stateful } from "./transformers/stateful";

import { drop, dropWhile, dropUntil, dropLast, DropPredicate } from "./slicers/drop";
import { init } from "./slicers/init";
import { slice } from "./slicers/slice";
import { tail } from "./slicers/tail";
import { take, takeWhile, takeUntil, takeLast, TakePredicate } from "./slicers/take";

import { debounce } from "./retimers/debounce";
import { delay } from "./retimers/delay";
import { liveUntil } from "./retimers/liveUntil";
import { throttle } from "./retimers/throttle";
import { synchronize } from "./retimers/synchronize";
import { valve, release, releaseOnEnd } from "./retimers/valve";
import { sort } from "./retimers/sort";

import { collect } from "./reducers/collect";
import { consume } from "./reducers/consume";
import { drain } from "./reducers/drain";
import { forEach } from "./reducers/forEach";
import { groupBy } from "./reducers/groupBy";
import { inject } from "./reducers/inject";
import { join } from "./reducers/join";
import { keyBy } from "./reducers/keyBy";
import { sum, product, mean, bounds, min, max } from "./reducers/math";
import { reduce } from "./reducers/reduce";
import { toMap } from "./reducers/toMap";
import { toArray } from "./reducers/toArray";
import { toSet } from "./reducers/toSet";

import { count } from "./queries/count";
import { every } from "./queries/every";
import { find, findLast } from "./queries/find";
import { first } from "./queries/first";
import { last } from "./queries/last";
import { pick } from "./queries/pick";
import { some } from "./queries/some";
import { tap } from "./queries/tap";

import { AsyncIterableSubject, subject } from "./generators/subject";
import { empty } from "./generators/empty";
import { range } from "./generators/range";
import { repeat, single } from "./generators/repeat";

import { filterErrors } from "./errors/filterErrors";
import { mapEither } from "./errors/mapEither";
import { mapErrors } from "./errors/mapErrors";
import { dropErrors } from "./errors/dropErrors";
import { dropValues } from "./errors/dropValues";
import { splitErrors } from "./errors/splitErrors";
import { takeErrors } from "./errors/takeErrors";
import { ErrorMatcher, takeUntilErrors } from "./errors/takeUntilErrors";
import { throwIf } from "./errors/throwIf";

import { dynamic } from "./constructors/dynamic";
import { fromArray } from "./constructors/fromArray";
import { fromPromisesArray as fromPromisesArray } from "./constructors/fromPromisesArray";
import { paginate, PaginationMethod } from "./constructors/paginate";

import { concat } from "./combinators/concat";
import { flatten, flattenConcurrent, flattenLast, flatMap, flatMapLast, flatMapConcurrent, flattenSorted, flatMapSorted } from "./combinators/flatMap";
import { parallel } from "./combinators/parallel";
import { merge } from "./combinators/merge";

import { dup, fork, SharedNetwork, shared } from "./misc/shared";
import { replay } from "./misc/replay";

import { Collector, Comparator } from "data-collectors";

export class AsyncStream<T> implements AsyncIterable<T> {
    /* GENERATORS */
    static empty <T = void> () : AsyncStream<T> {
        return new AsyncStream( empty() );
    }

    static single <T> ( value : T ) : AsyncStream<T> {
        return new AsyncStream( single( value ) );
    }

    static range ( start : number = 0, end : number = Infinity, step : number = 1 ) : AsyncStream<number> {
        return new AsyncStream( range( start, end, step ) );
    }

    static repeat <T = void> ( value : T = void 0, count : number = Infinity ) : AsyncStream<T> {
        return new AsyncStream( repeat( value, count ) );
    }

    static subject <T> () : [ AsyncIterableSubject<T>, AsyncStream<T> ] {
        const sub = subject<T>();

        return [ sub, new AsyncStream( sub ) ];
    }

    /* CONSTRUCTORS */
    static from<T> ( iterable : AsyncIterableLike<T> ) : AsyncStream<T> {
        return new AsyncStream( iterable );
    }

    static dynamic<T> ( factory : () => AsyncIterableLike<T>, lazy : boolean = false ) : AsyncStream<T> {
        return new AsyncStream( dynamic( factory, lazy ) );
    }

    static fromArray<T> ( array : T[] | Promise<T[]> ) : AsyncStream<T> {
        return new AsyncStream( fromArray( array ) );
    }

    static fromPromisesArray<T> ( promises : Promise<T>[], sequential : boolean = false ) : AsyncStream<T> {
        return new AsyncStream( fromPromisesArray( promises, sequential ) );
    }

    static fromPromise<T> ( promise : Promise<T> ) : AsyncStream<T> {
        return new AsyncStream( fromPromise( promise ) );
    }

    static stateful<S, T> ( reducer : ( item : S ) => [S,  T] | Promise<[S, T]>, seed : S ) : AsyncStream<T> {
        return AsyncStream.repeat( null ).stateful( state => reducer( state ), seed );
    }

    static paginate<T> ( supplier : ( page : number ) => AsyncIterableLike<T>, method : PaginationMethod = PaginationMethod.Page, start : number = 0 ) {
        return new AsyncStream( paginate( supplier, method, start ) );
    }

    /* COMBINATORS */
    static concat<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> ) : AsyncStream<T> {
        return new AsyncStream( concat( iterables ) );
    }

    static flatten<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> ) : AsyncStream<T> {
        return new AsyncStream( flatten( iterables ) );
    }

    static flattenLast<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>>, concurrency : number ) : AsyncStream<T> {
        return new AsyncStream( flattenLast( iterables, concurrency ) );
    }

    static flattenConcurrent<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>>, concurrency : number, switchFast : boolean = false ) : AsyncStream<T> {
        return new AsyncStream( flattenConcurrent( iterables, concurrency, switchFast ) );
    }

    static flattenSorted<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>>, comparator : Comparator<T> ) : AsyncStream<T> {
        return new AsyncStream( flattenSorted( iterables, comparator ) );
    }

    static merge<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> ) : AsyncStream<T> {
        return new AsyncStream( merge( iterables ) );
    }

    /* RETIMERS */
    static synchronize<T> ( iterables : Iterable<AsyncIterableLike<T>>, lag ?: number ) : AsyncStream<T>[];
    static synchronize<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>>, lag ?: number ) : AsyncStream<AsyncStream<T>>;
    static synchronize<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> | Iterable<AsyncIterableLike<T>>, lag : number = 0 ) : AsyncStream<T>[] | AsyncStream<AsyncStream<T>> {
        const result = synchronize( iterables, lag );

        if ( result instanceof Array ) {
            return result.map( iterable => new AsyncStream( iterable ) );
        } else {
            return new AsyncStream( map( result, iterable => new AsyncStream( iterable ) ) );
        }
    }

    /* INSTANCE */

    protected iterable : AsyncIterableLike<T>;

    constructor ( iterable : AsyncIterableLike<T> ) {
        this.iterable = iterable;
    }

    /* COMBINATORS */
    flatMap<U> ( mapper : ( item : T, index : number ) => AsyncIterableLike<U> ) : AsyncStream<U> {
        return new AsyncStream( flatMap( this.iterable, mapper ) );
    }

    flatMapLast<U> ( mapper : ( item : T, index : number ) => AsyncIterableLike<U>, concurrency : number ) : AsyncStream<U> {
        return new AsyncStream( flatMapLast( this.iterable, mapper, concurrency ) );
    }

    flatMapConcurrent<U> ( mapper : ( item : T, index : number ) => AsyncIterableLike<U>, concurrency : number, switchFast : boolean = false ) : AsyncStream<U> {
        return new AsyncStream( flatMapConcurrent( this.iterable, mapper, concurrency, switchFast ) );
    }

    flatMapSorted<U> ( mapper : ( item : T, index : number ) => AsyncIterableLike<U>, comparator : Comparator<U> ) : AsyncStream<U> {
        return new AsyncStream( flatMapSorted( this.iterable as AsyncIterable<any>, mapper, comparator ) );
    }

    flatten<U> () : AsyncStream<T extends AsyncIterableLike<U> ? U : never> {
        return new AsyncStream( flatten( this.iterable as AsyncIterable<any> ) );
    }

    flattenLast<U> ( concurrency : number ) : AsyncStream<T extends AsyncIterableLike<U> ? U : never> {
        return new AsyncStream( flattenLast( this.iterable as AsyncIterable<any>, concurrency ) );
    }

    flattenConcurrent<U> ( concurrency : number, switchFast : boolean = false ) : AsyncStream<T extends AsyncIterableLike<U> ? U : never> {
        return new AsyncStream( flattenConcurrent( this.iterable as AsyncIterable<any>, concurrency, switchFast ) );
    }

    flattenSorted<U> ( comparator : Comparator<U> ) : AsyncStream<T extends AsyncIterableLike<U> ? U : never> {
        return new AsyncStream( flattenSorted( this.iterable as AsyncIterable<any>, comparator as any ) );
    }

    parallel <U> ( fn : ( item : T, index : number ) => U | Promise<U> | Promise<never>, concurent : number ) : AsyncStream<U> {
        return new AsyncStream( parallel( this.iterable, fn, concurent ) );
    }

    concat ( first : AsyncIterableLike<T>, ...values : AsyncIterableLike<T>[] ) : AsyncStream<T>;
    concat<U> () : AsyncStream<T extends AsyncIterableLike<U> ? U : never>;
    concat ( ...args : any[] ) : AsyncStream<any> {
        if ( arguments.length == 0 ) {
            return new AsyncStream( concat( this.iterable as AsyncIterable<any> ) );
        } else {
            return new AsyncStream( concat( [ this.iterable, ...args ] ) );
        }
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               

    merge ( first : AsyncIterableLike<T>, ...values : AsyncIterableLike<T>[] ) : AsyncStream<T>;
    merge<U> () : AsyncStream<T extends AsyncIterableLike<U> ? U : never>;
    merge ( ...args : any[] ) : AsyncStream<any> {
        if ( arguments.length == 0 ) {
            return new AsyncStream( merge( this.iterable as AsyncIterable<any> ) );
        } else {
            return new AsyncStream( merge( [ this.iterable, ...args ] ) );
        }
    }

    /* ERRORS */
    filterErrors ( predicate : ( err : any, index : number ) => boolean | Promise<boolean> | Promise<never> ) : AsyncStream<T> {
        return new AsyncStream( filterErrors( this.iterable, predicate ) );
    }

    mapEither<E = any> () : AsyncStream<Either<T, E>> {
        return new AsyncStream( mapEither( this.iterable ) );
    }

    mapErrors ( mapper : ( err : any, index : number ) => T | Promise<T> | Promise<never>, keepErrors ?: false ) : AsyncStream<T>;
    mapErrors ( mapper : ( err : any, index : number ) => any | Promise<any> | Promise<never>, keepErrors : true | boolean ) : AsyncStream<T>;
    mapErrors ( mapper : ( err : any, index : number ) => T | Promise<T> | Promise<never>, keepErrors : boolean = false ) : AsyncStream<T> {
        return new AsyncStream( mapErrors( this.iterable, mapper, keepErrors ) );
    }
    
    dropErrors () : AsyncStream<T> {
        return new AsyncStream( dropErrors( this.iterable ) );
    }

    dropValues () : AsyncStream<any> {
        return new AsyncStream( dropValues( this.iterable ) );
    }

    splitErrors<E = any> () : [ AsyncStream<E>, AsyncStream<T> ] {
        const [ errors, values ] = splitErrors<T, E>(  this.iterable );

        return [ new AsyncStream( errors ), new AsyncStream( values ) ];
    }

    takeErrors () : AsyncStream<T> {
        return new AsyncStream( takeErrors( this.iterable ) );
    }

    takeUntilErrors ( predicate : ErrorMatcher, count ?: number, contiguous ?: boolean ) : AsyncStream<T>;
    takeUntilErrors ( count ?: number, contiguous ?: boolean ) : AsyncStream<T>;
    takeUntilErrors ( predicate : ErrorMatcher | number = null, count : number | boolean = 1, contiguous : boolean = false ) : AsyncStream<T> {
        return new AsyncStream( takeUntilErrors( this.iterable, predicate as any, count as any, contiguous ) );
    }

    throwIf ( predicate : ( value : T, index : number ) => boolean | Error | Promise<boolean> | Promise<Error> | Promise<never> = null ) : AsyncStream<T> {
        return new AsyncStream( throwIf( this.iterable, predicate ) );
    }

    /* REDUCERS */
    collect<R> ( collector : Collector<T, any, R> ) : Promise<R> {
        return collect( this.iterable, collector );
    }

    consume ( observer : Partial<Observer<T>>, ignoreErrors : boolean = true ) : Promise<void> {
        return consume( this.iterable, observer, ignoreErrors );
    }

    drain ( ignoreErrors : boolean = false ) : Promise<void> {
        return drain( this.iterable, ignoreErrors );
    }

    forEach ( action : ( item : T ) => any | Promise<any>, onError ?: ( error : any ) => any | Promise<any> ) : Promise<void> {
        return forEach( this.iterable, action );
    }

    groupBy<K> ( keyer : ( item : T ) => K ) : Promise<Map<K, T[]>>;
    groupBy<K, O = T> ( keyer : ( item : T ) => K, transform : ( values : T[] ) => O ) : Promise<Map<K, O>>;
    groupBy<K, O = T> ( keyer : ( item : T ) => K, transform ?: ( values : T[] ) => O ) : Promise<Map<K, O | T[]>> {
        return groupBy( this.iterable, keyer, transform );
    }

    inject <R> ( reducer : ( memo : R, item : T ) => any, seed : R ) : Promise<R> {
        return inject( this.iterable, reducer, seed );
    }

    join ( separator = ',' ) : Promise<string> {
        return join( this.iterable, separator );
    }

    keyBy<K> ( keyer : ( item : T ) => K ) : Promise<Map<K, T>> {
        return keyBy( this.iterable, keyer );
    }

    // TODO study conditional types for this
    sum () : Promise<number> {
        return sum( this.iterable as AsyncIterable<any> );
    }

    product () : Promise<number> {
        return product( this.iterable as AsyncIterable<any> );
    }

    mean () : Promise<number> {
        return mean( this.iterable as AsyncIterable<any> );
    }

    bounds () : Promise<[ number, number ]> {
        return bounds( this.iterable as AsyncIterable<any> );
    }

    min () : Promise<number> {
        return min( this.iterable as AsyncIterable<any> );
    }

    max () : Promise<number> {
        return max( this.iterable as AsyncIterable<any> );
    }

    reduce<R> ( reducer : ( memo : R, item : T ) => R, seed : R ) : Promise<R> {
        return reduce( this.iterable, reducer, seed );
    }

    toMap<K, V> ( cancel ?: CancelToken ) : T extends [K, V] ? Promise<Map<K, V>> : never {
        return toMap<K, V>( this.iterable as AsyncIterable<any> ) as any;
    }

    toArray ( cancel ?: CancelToken ) : Promise<T[]> {
        return toArray( this.iterable );
    }

    toSet ( cancel ?: CancelToken ) : Promise<Set<T>> {
        return toSet( this.iterable );
    }

    /* MISC */
    shared () : SharedNetwork<T> {
        return shared( this.iterable );
    }

    fork ( count : number )  : AsyncStream<T>[] {
        return fork( this.iterable, count )
            .map( iterable => new AsyncStream( iterable ) );
    }

    dup () : [ AsyncStream<T>, AsyncStream<T> ] {
        const [ a, b ] = dup( this.iterable );

        return [ new AsyncStream( a ), new AsyncStream( b ) ];
    }

    replay () : AsyncStream<T> {
        return new AsyncStream<T>( replay( this.iterable ) );
    }

    synchronize <U> ( lag ?: number ) : AsyncStream<T extends AsyncIterableLike<U> ? AsyncStream<U> : never> {
        return AsyncStream.synchronize<any>( this.iterable as AsyncIterable<any>, lag ) as any;
    }
    
    /* QUERIES */
    count () : Promise<number> {
        return count( this.iterable );
    }

    every ( predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : Promise<boolean> {
        return every( this.iterable, predicate );
    }

    find ( predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, optional ?: false ) : Promise<T>;
    find ( predicate : ( item : T, index : number ) => Promise<boolean> | boolean, optional : true ) : Promise<Optional<T>>;
    find ( predicate : ( item : T, index : number ) => Promise<boolean> | boolean, optional : boolean ) : Promise<T | Optional<T>>;
    find ( predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, optional : boolean = false ) : Promise<T | Optional<T>> {
        return find( this.iterable, predicate, optional );
    }

    findLast ( predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, optional ?: false ) : Promise<T>;
    findLast ( predicate : ( item : T, index : number ) => Promise<boolean> | boolean, optional : true ) : Promise<Optional<T>>;
    findLast ( predicate : ( item : T, index : number ) => Promise<boolean> | boolean, optional : boolean ) : Promise<T | Optional<T>>;
    findLast ( predicate ?: ( item : T, index : number ) => Promise<boolean> | boolean, optional : boolean = false ) : Promise<T | Optional<T>> {
        return findLast( this.iterable, predicate, optional );
    }

    first ( optional ?: false ) : Promise<T>;
    first ( optional : true ) : Promise<Optional<T>>;
    first ( optional : boolean ) : Promise<T | Optional<T>>;
    first ( optional : boolean = false ) : Promise<T | Optional<T>> {
        return first( this.iterable, optional );
    }

    last ( optional ?: false ) : Promise<T>;
    last ( optional : true ) : Promise<Optional<T>>;
    last ( optional : boolean ) : Promise<T | Optional<T>>;
    last ( optional : boolean = false ) : Promise<T | Optional<T>> {
        return last( this.iterable, optional );
    }

    pick ( index : number, optional ?: false ) : Promise<T>;
    pick ( index : number, optional : true ) : Promise<Optional<T>>;
    pick ( index : number, optional : boolean ) : Promise<T | Optional<T>>;
    pick ( index : number, optional : boolean = false ) : Promise<T | Optional<T>> {
        return pick( this.iterable, index, optional );
    }

    some ( predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : Promise<boolean> {
        return some( this.iterable, predicate );
    }

    tap ( action : ( item : T, index : number ) => any | Promise<any> ) : AsyncStream<T> {
        return new AsyncStream( tap( this.iterable, action ) );
    }

    /* RETIMERS */
    debounce ( interval : number ) : AsyncStream<T> {
        return new AsyncStream( debounce( this.iterable, interval ) );
    }

    delay ( timestamp : number | ( () => Promise<any> ) ) : AsyncStream<T> {
        return new AsyncStream( delay( this.iterable, timestamp ) );
    }

    liveUntil ( promise : Promise<void> ) : AsyncStream<T> {
        return new AsyncStream( liveUntil( this.iterable, promise ) );
    }

    sort ( comparator ?: Comparator<T> ) : AsyncStream<T> {
        return new AsyncStream( sort( this.iterable, comparator ) );
    }

    throttle ( interval : number ) : AsyncStream<T> {
        return new AsyncStream( throttle( this.iterable, interval ) );
    }

    valve ( semaphore : SemaphoreLike ) : AsyncStream<T> {
        return new AsyncStream( valve( this.iterable, semaphore ) );
    }

    release ( semaphore : SemaphoreLike ) : AsyncStream<T> {
        return new AsyncStream( release( this.iterable, semaphore ) );
    }

    releaseOnEnd ( semaphore : SemaphoreLike ) : AsyncStream<T> {
        return new AsyncStream( releaseOnEnd( this.iterable, semaphore ) );
    }

    /* SLICERS */
    drop ( count : number, countErrors : boolean = false ) : AsyncStream<T> {
        return new AsyncStream( drop( this.iterable, count, countErrors ) );
    }

    dropWhile ( predicate : DropPredicate<T> ) : AsyncStream<T> {
        return new AsyncStream( dropWhile( this.iterable, predicate ) );
    }

    dropUntil ( predicate : DropPredicate<T> | Promise<unknown> ) : AsyncStream<T> {
        return new AsyncStream( dropUntil( this.iterable, predicate ) );
    }

    dropLast ( count : number ) : AsyncStream<T> {
        return new AsyncStream( dropLast( this.iterable, count ) );
    }

    init () : AsyncStream<T> {
        return new AsyncStream( init( this.iterable ) );
    }

    slice ( start : number = 0, end : number = Infinity ) : AsyncStream<T> {
        return new AsyncStream( slice( this.iterable, start, end ) );
    }

    tail () : AsyncStream<T> {
        return new AsyncStream( tail( this.iterable ) );
    }

    take ( count : number ) : AsyncStream<T> {
        return new AsyncStream( take( this.iterable, count ) );
    }

    takeWhile ( predicate : TakePredicate<T> ) : AsyncStream<T> {
        return new AsyncStream( takeWhile( this.iterable, predicate ) );
    }

    takeUntil ( predicate : TakePredicate<T> | Promise<unknown> ) : AsyncStream<T> {
        return new AsyncStream( takeUntil( this.iterable, predicate ) );
    }

    takeLast ( count : number ) : AsyncStream<T> {
        return new AsyncStream( takeLast( this.iterable, count ) );
    }

    /* TRANSFORMERS */
    map <O> ( mapper : ( item : T, index : number ) => O | Promise<O> | Promise<never>, resolve ?: true ) : AsyncStream<O>;
    map <O> ( mapper : ( item : T, index : number ) => O, resolve : boolean ) : AsyncStream<O>;
    map <O> ( mapper : ( item : T, index : number ) => O | Promise<O> | Promise<never>, resolve : boolean = true ) : AsyncStream<O> {
        return new AsyncStream( map<T, any>( this.iterable, mapper, resolve ) );
    }

    filter ( predicate : ( item : T, index : number ) => boolean | Promise<boolean> | Promise<never> ) {
        return new AsyncStream( filter( this.iterable, predicate ) );
    }

    reject ( predicate : ( item : T, index : number ) => boolean | Promise<boolean> | Promise<never> ) {
        return new AsyncStream( reject( this.iterable, predicate ) );
    }

    distinctUntilChanged () : AsyncStream<T> {
        return new AsyncStream( distinctUntilChanged( this.iterable ) );
    }

    distinct () : AsyncStream<T> {
        return new AsyncStream( distinct( this.iterable ) );
    }

    describe () : AsyncStream<IterablePackage<T>> {
        return new AsyncStream( describe( this.iterable ) );
    }

    cancellable ( cancel ?: CancelToken ) : AsyncStream<T> {
        return new AsyncStream( cancellable( this.iterable, cancel ) );
    }

    chunk<U> ( fn : ( item : T, index : number, buffer : U[] ) => AsyncIterableLike<U | symbol>, autoFlush : boolean = true ) : AsyncStream<U[]> {
        return new AsyncStream( chunk( this.iterable, fn, autoFlush ) );
    }

    chunkByLines () : AsyncStream<string> {
        return new AsyncStream( chunkByLines( this.iterable as AsyncIterable<any> ) );
    }

    chunkEvery ( count : number ) : AsyncStream<T[]> {
        return new AsyncStream( chunkEvery( this.iterable, count ) );
    }

    chunkUntil ( predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncStream<T[]> {
        return new AsyncStream( chunkUntil( this.iterable, predicate ) );
    }

    chunkWhile ( predicate : ( item : T, index : number ) => boolean | Promise<boolean> ) : AsyncStream<T[]> {
        return new AsyncStream( chunkWhile( this.iterable, predicate ) );
    }

    buffered ( size : number ) : AsyncStream<T> {
        return new AsyncStream( buffered( this.iterable, size ) );
    }

    observe ( observer : Partial<Observer<T>> ) : AsyncStream<T> {
        return new AsyncStream( observe( this.iterable, observer ) );
    }

    log ( label ?: string ) : AsyncStream<T> {
        return new AsyncStream( log( this.iterable, label ) );
    }

    logErrors ( label ?: string ) : AsyncStream<T> {
        return new AsyncStream( logErrors( this.iterable, label ) );
    }

    scan <R> ( reducer : ( memo : R, item : T ) => R | Promise<R>, seed : R ) : AsyncStream<R> {
        return new AsyncStream( scan( this.iterable, reducer, seed ) );
    }

    scanSelf ( reducer : ( memo : T, item : T ) => T ) : AsyncStream<T> {
        return new AsyncStream( scanSelf( this.iterable, reducer ) );
    }

    stateful<U, S> ( reducer : ( state : S, item : T ) => [S, U] | Promise<[S, U]>, seed : S ) : AsyncStream<U> {
        return new AsyncStream( stateful( this.iterable, reducer, seed ) );
    }

    /* CUSTOMIZABLE */
    pipe <U> ( fn : ( it : AsyncIterableLike<T> ) => AsyncIterableLike<U> ) : AsyncStream<U> {
        return new AsyncStream( fn( this.iterable ) );
    }

    lazyPipe<U> ( fn : ( it : AsyncIterableLike<T> ) => AsyncIterableLike<U> ) : AsyncStream<U> {
        return this.lazy( stream => fn( stream.iterable ) );
    }

    lazy<U> ( fn : ( it : AsyncStream<T> ) => AsyncIterableLike<U> ) : AsyncStream<U> {
        return this.dynamic( fn, true );
    }

    dynamic<U> ( fn : ( it : AsyncStream<T> ) => AsyncIterableLike<U>, lazy : boolean = false ) : AsyncStream<U> {
        return AsyncStream.dynamic( () => fn( this ), lazy );
    }

    /* CONERTERS */
    [ Symbol.asyncIterator ] () {
        return this.toAsyncIterator();
    }

    toAsyncIterator () {
        return toAsyncIterator( this.iterable );
    }

    toAsyncIterable () {
        return toAsyncIterable( this.iterable );
    }

    toAsyncIterableIterator () {
        return toAsyncIterableIterator( this.iterable );
    }
}
