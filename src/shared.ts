import { AsyncIterableLike } from "./core";
import { AsyncIterableEmitter, emits } from "./generators/emits";
import { from } from "./constructors/from";

export class SharedIterable<T> implements AsyncIterable<T> {
    emitters : Set<AsyncIterableEmitter<T>> = new Set();

    autoReturn : boolean = true;

    protected iterable : AsyncIterable<T>;
    protected iterator : AsyncIterator<T>;

    constructor ( iterable : AsyncIterableLike<T> ) {
        this.iterable = from( iterable );
        this.iterator = this.iterable[ Symbol.asyncIterator ]();
    }

    protected async onBranchQueue ( emitter : AsyncIterableEmitter<T> ) {
        try {
            const { done, value } = await this.iterator.next();

            if ( done ) {
                for ( let em of this.emitters ) {
                    em.end();
                }
            } else {
                for ( let em of this.emitters ) {
                    em.value( value );
                }
            }
        } catch ( error ) {
            for ( let em of this.emitters ) {
                em.exception( error );
            }
        }
    }

    protected onBranchReturn ( emitter : AsyncIterableEmitter<T> ) {
        this.emitters.delete( emitter );

        if (  this.autoReturn && this.emitters.size === 0 ) {
            this.return();
        }
    }    

    fork () : AsyncIterableIterator<T> {
        const emitter = emits<T>();
        
        this.emitters.add( emitter );

        emitter.on( 'pull-queue', () => this.onBranchQueue( emitter ) );
        emitter.on( 'return', () => this.onBranchReturn( emitter ) );

        return emitter;
    }

    return () {
        this.iterator.return();

        for ( let emitter of this.emitters ) {
            emitter.end();
        }

        this.emitters.clear();
    }

    [ Symbol.asyncIterator ] () {
        return this.fork();
    }
}

export function shared<T> ( iterable : AsyncIterableLike<T>, bufferSize : number = Infinity ) : SharedIterable<T> {
    return new SharedIterable<T>( iterable );
}

export function fork<T> ( iterable : AsyncIterableLike<T>, count : number ) : AsyncIterableIterator<T>[] {
    const sh = shared( iterable );

    return Array.from( new Array( count ).keys() ).map( () => sh.fork() );
}

export function dup<T> ( iterable : AsyncIterableLike<T> ) : [ AsyncIterableIterator<T>, AsyncIterableIterator<T> ] {
    return fork( iterable, 2 ) as any;
}