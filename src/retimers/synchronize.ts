import { AsyncIterableLike, isSync } from "../core";
import { Semaphore, SemaphoreLike, StackedSemaphore, SemaphoreRelease } from "data-semaphore";
import { from } from "../constructors/from";
import { valve } from "./valve";
import { observe } from "../transformers/observe";
import { map } from "../transformers/map";

export function synchronize<T> ( iterables : Iterable<AsyncIterableLike<T>>, lag ?: number ) : AsyncIterableIterator<T>[];
export function synchronize<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>>, lag ?: number ) : AsyncIterableIterator<AsyncIterableIterator<T>>;
export function synchronize<T> ( iterables : AsyncIterableLike<AsyncIterableLike<T>> | Iterable<AsyncIterableLike<T>>, lag : number = 0 ) : AsyncIterableIterator<T>[] | AsyncIterableIterator<AsyncIterableIterator<T>> {
    const barrier = new Barrier( 0, lag );
    
    const each = ( iterator : AsyncIterableLike<T>, semaphore : BarrierSemaphore ) => {
        const throttle = valve( iterator, semaphore );

        return observe( throttle, {
            onEnd () {
                barrier.remove( semaphore );
            }
        } );
    }

    if ( isSync( iterables ) ) {
        const iterators = Array.from( iterables );
        
        barrier.increase( iterators.length );

        return iterators.map( ( iterator, index ) => each( iterator, barrier.getSemaphore( index ) ) );
    } else {
        const barrier = new Barrier( 0, lag );
        
        return map( iterables, iterator => each( iterator, barrier.add() ) );
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

        if ( index > 0 ) {
            this.decrease( 1, index );
        }
        
        return this;
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
        this.barrier.arrived( this.index );

        await this.stacked.acquire();

        return this.release.bind( this );
    }

    release(): void {
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