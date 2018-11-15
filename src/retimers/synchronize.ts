import { AsyncIterableLike, isSync, toAsyncIterable } from "../core";
import { Semaphore, SemaphoreLike, SemaphoreRelease } from "data-semaphore";
import { valve } from "./valve";
import { observe } from "../transformers/observe";
import { map } from "../transformers/map";
import { LinkedIterables } from "../misc/linkedIterables";

export class SynchronizeNetwork {
    link : LinkedIterables<Barrier>;

    constructor ( bufferSize : number = 0 ) {
        this.link = new LinkedIterables( () => new Barrier( 0, bufferSize ), true );
    }

    connect<T> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<T> {
        return this.link.create( barrier => {
            const semaphore = barrier.add();

            const throttled = valve( iterable, semaphore );

            return observe( throttled, {
                onValue: () => {
                    this.link.purge( barrier );
                },

                onEnd: () => {
                    barrier.remove( semaphore );
                }
            } )
        } );
    }
}

export function synchronize<T> ( iterables : Iterable<AsyncIterableLike<T>>, lag ?: number ) : AsyncIterable<T>[];
export function synchronize<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>>, lag ?: number ) : AsyncIterable<AsyncIterable<T>>;
export function synchronize<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> | Iterable<AsyncIterableLike<T>>, lag : number = 0 ) : AsyncIterable<T>[] | AsyncIterable<AsyncIterable<T>> {
    const network = new SynchronizeNetwork( lag );

    if ( isSync( iterables ) ) {
        const iterators = Array.from( iterables );

        if ( lag == Infinity ) {
            return iterators.map( it => toAsyncIterable( it ) );
        }
        
        return iterators.map( it => network.connect( it ) );
    } else {
        if ( lag == Infinity ) {
            return map( iterables, it => toAsyncIterable( it ) );
        }
        
        return map( iterables, iterator => network.connect( iterator ) );
    }
}

export class Barrier {
    protected _seats : number = 0;

    protected arrivals : number = 0;

    protected lag : number = 1;

    protected semaphores : BarrierSemaphore[] = [];

    get seats () : number {
        return this._seats;
    }

    set seats ( number : number ) {
        if ( number < 0 ) {
            throw new Error( `Barrier value cant be less than zero: ${ number }.` );
        }

        const diff = number - this._seats;

        if ( diff > 0 ) {
            this.increase( diff );
        } else if ( diff < 0 ) {
            this.decrease( -diff );
        }
    }

    constructor ( seats : number, lag : number = 1 ) {
        this.lag = lag;
        this.seats = seats;
    }

    getSemaphore ( index : number ) : BarrierSemaphore {
        return this.semaphores[ index ];
    }

    increase ( count : number = 1 ) : this {
        while ( count > 0 ) {
            this._seats++;

            this.semaphores.push( new BarrierSemaphore( this, this.seats - 1, this.lag ) );

            count--;
        }
        
        return this;
    }

    decrease ( count : number = 1, index : number = null ) : this {
        if ( index ) {
            index = this.semaphores.length - count;
        }

        while ( count > 0 ) {
            if ( this.semaphores[ index ].hasArrived ) {
                this.arrivals--;
            }

            this._seats--;

            this.semaphores.splice( index, 1 );

            count--;
        }

        for ( let [ index, semaphore ] of this.semaphores.entries() ) {
            semaphore.index = index;
        }

        this.tryRelease();        

        return this;
    }

    add () : BarrierSemaphore {
        this.increase( 1 );

        return this.semaphores[ this.semaphores.length - 1 ];
    }

    remove ( semaphore : BarrierSemaphore ) : this {
        const index = this.semaphores.indexOf( semaphore );

        if ( index >= 0 ) {
            this.decrease( 1, index );
        }
        
        return this;
    }

    has ( semaphore : BarrierSemaphore ) : boolean {
        return this.semaphores.indexOf( semaphore ) >= 0;
    }

    protected tryRelease () {
        if ( this.arrivals == this.seats ) {
            for ( let semaphore of this.semaphores ) {
                semaphore.release();
            }

            this.arrivals = this.semaphores.filter( sem => sem.hasArrived ).length;
        }
    }

    arrived ( index : number ) {
        if ( !this.getSemaphore( index ).hasArrived ) {
            this.arrivals++;
        }

        this.tryRelease();
    }

    wait ( index : number ) : Promise<void> {
        const semaphore = this.getSemaphore( index );

        return semaphore.acquire() as any;
    }
}

export class BarrierSemaphore implements SemaphoreLike {
    get hasArrived () : boolean {
        return this.stacked.acquired > 0;
    }

    get isLocked () : boolean {
        return this.stacked.isLocked;
    }
    
    barrier : Barrier;

    index : number;

    lag : number;

    protected stacked : Semaphore;

    constructor ( barrier : Barrier, index : number, lag : number = 1 ) {
        this.barrier = barrier;
        this.index = index;
        this.lag = lag;

        this.stacked = new Semaphore( this.lag );
    }

    async acquire () : Promise<SemaphoreRelease> {
        if ( this.barrier.has( this ) ) {
            this.barrier.arrived( this.index );
    
            await this.stacked.acquire();
        }

        return this.release.bind( this );
    }

    release () : void {
        this.stacked.release();
    }

    async use <T> ( fn : () => T | PromiseLike<T> ) : Promise<T> {
        const release = await this.acquire();

        try {
            return await fn();
        } finally {
            release();
        }
    }
}
