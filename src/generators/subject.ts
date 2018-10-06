import { Semaphore } from "data-semaphore";
import { Future } from "@pedromsilva/data-future";
import { Either } from "@pedromsilva/data-either";
import EventEmitter from 'eventemitter3';

export class AsyncIterableSubject<T> extends EventEmitter implements AsyncIterableIterator<T> {
    protected pushBuffer : Either<T, any>[] = [];

    protected pullQueue : Future<IteratorResult<T>>[] = [];

    protected pullThrottle : Semaphore;

    protected returnFuture : Future<void>;

    protected ended : boolean = false;

    protected returned : boolean = false;

    get isPulling () : boolean {
        return this.pullQueue.length > 0;
    }

    get canPull () : boolean {
        return this.pushBuffer.length > 0;        
    }

    constructor ( throttlePulls : number = 1 ) {
        super();

        this.pullThrottle = new Semaphore( throttlePulls );
    }

    push ( item : Either<T, any> ) {
        if ( this.ended ) return;

        if ( this.pullQueue.length ) {
            this.emit( 'push', item );
            this.emit( 'push-queue', item );

            if ( item.isLeft() ) {
                this.pullQueue.shift().resolve( { done: false, value: item.getLeft() } );
            } else {
                this.pullQueue.shift().reject( item.getRight() );
            }

            if ( this.returned && this.pullQueue.length == 0 ) {
                this.returnFuture.resolve();

                this.returnFuture = null;
            }
        } else {
            if ( this.returned ) return;

            this.emit( 'push', item );
            this.emit( 'push-buffer', item );

            this.pushBuffer.push( item );
        }
    }

    pushValue ( value : T ) {
        this.push( Either.left( value ) );
    }

    pushException ( exception : any ) {
        this.push( Either.right( exception ) );
    }

    protected flush () {
        if ( this.pushBuffer.length == 0 ) {
            for ( let future of this.pullQueue ) {
                future.resolve( { done: true, value: null } );
            }
        }
    }

    end () {
        if ( !this.end ) this.emit( 'end' );

        this.ended = true;

        this.flush();
    }

    [ Symbol.asyncIterator ] () : AsyncIterableIterator<T> {
        return this;
    }

    async next ( value ?: any ) : Promise<IteratorResult<T>> {
        if ( this.pushBuffer.length > 0 ) {
            const item = this.pushBuffer.shift();

            this.emit( 'pull-buffered', value, item );
            this.emit( 'pull', value, item );

            if ( item.isLeft() ) {
                return { done: false, value: item.getLeft() };
            } else {
                throw item.getRight();
            }
        }

        if ( this.ended || this.returned ) {
            return { done: true, value: null };
        }

        const future : Future<IteratorResult<T>> = new Future();

        this.pullQueue.push( future );

        this.emit( 'pull-queue', value );
        this.emit( 'pull', value );

        return future.promise;
    }

    async return ( value ?: any ) : Promise<IteratorResult<T>> {
        if ( !this.returned ) this.emit( 'return' );

        this.returned = true;

        if ( this.pullQueue.length == 0 ) {
            this.pushBuffer = [];

            return { done: true, value };
        }

        if ( !this.returnFuture ) {
            this.returnFuture = new Future();
        }
        
        await this.returnFuture.promise;

        return { done: true, value };
    }
}

export function subject<T> () : AsyncIterableSubject<T> {
    return new AsyncIterableSubject<T>();
}