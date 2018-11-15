import { AsyncIterableLike, toAsyncIterable, toAsyncIterator } from "../core";
import { AsyncIterableSubject, subject } from "../generators/subject";
import { LinkedIterables } from "./linkedIterables";
// import { Semaphore } from "data-semaphore";

export interface SharedNetworkInstance<T> {
    emitters : Set<AsyncIterableSubject<T>>;
    iterator : AsyncIterator<T>;
    connections : number;
}

// TODO study the option to use, when bufferCapacity < Infinity, of returning synchronized versions of the iterables
// Caveat: synchronize does not seem to support removing emitters right now, maybe that needs to be added on return
export class SharedNetwork<T> {
    autoReturn : boolean = true;

    protected iterable : AsyncIterable<T>;
    
    protected link : LinkedIterables<SharedNetworkInstance<T>>;

    constructor ( iterable : AsyncIterableLike<T> ) {
        this.iterable = toAsyncIterable( iterable );

        this.link = new LinkedIterables( () => ( { 
            emitters: new Set( new Array( this.link.connections ).fill( null ).map( () => subject<T>() ) ),
            iterator : toAsyncIterator( this.iterable ),
            connections: this.link.connections
        } ), true );
    }

    protected async onBranchQueue ( state : SharedNetworkInstance<T>, emitter : AsyncIterableSubject<T> ) {
        try {
            const { done, value } = await state.iterator.next();

            if ( done ) {
                for ( let em of state.emitters ) {
                    em.end();
                }
            } else {
                for ( let em of state.emitters ) {
                    em.pushValue( value );
                }
            }
        } catch ( error ) {
            for ( let em of state.emitters ) {
                em.pushException( error );
            }
        }
    }

    protected onBranchReturn ( state : SharedNetworkInstance<T>, emitter : AsyncIterableSubject<T> ) {
        state.emitters.delete( emitter );

        if ( this.autoReturn && state.emitters.size === 0 && state.connections == this.link.connections ) {
            this.return( state );
        }
    }    

    fork () : AsyncIterable<T> {
        return this.link.create( state => {
            state.connections++;

            const emitter = subject<T>();

            state.emitters.add( emitter );

            emitter.on( 'pull-queue', () => this.onBranchQueue( state, emitter ) );
            emitter.on( 'return', () => this.onBranchReturn( state, emitter ) );

            return emitter;
        }, true );
    }

    return ( state : SharedNetworkInstance<T> ) {
        state.iterator.return();

        for ( let emitter of state.emitters ) {
            emitter.end();
        }

        state.emitters.clear();

        this.link.purge( state );
    }
}

export function shared<T> ( iterable : AsyncIterableLike<T> ) : SharedNetwork<T> {
    return new SharedNetwork<T>( iterable );
}

export function fork<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterable<T>[] {
    const sh = shared( iterable );

    return Array.from( new Array( count ).keys() ).map( () => sh.fork() );
}

export function dup<T> ( iterable : AsyncIterableLike<T> ) : [ AsyncIterable<T>, AsyncIterable<T> ] {
    return fork( iterable, 2 ) as any;
}
