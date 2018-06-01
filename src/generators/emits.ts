import { Semaphore } from "data-semaphore";
import { Future } from "@pedromsilva/data-future";
import { Either } from "@pedromsilva/data-either";
import EventEmitter from 'eventemitter3';

export class AsyncIterableEmitter<T> extends EventEmitter implements AsyncIterableIterator<T> {
    protected buffer : Either<T, any>[] = [];

    protected queue : Future<IteratorResult<T>>[] = [];

    protected pullThrottle : Semaphore;

    protected returnFuture : Future<void>;

    protected ended : boolean = false;

    protected returned : boolean = false;

    constructor ( throttlePulls : number = 1 ) {
        super();

        this.pullThrottle = new Semaphore( throttlePulls );
    }

    push ( item : Either<T, any> ) {
        if ( this.ended ) return;

        if ( this.queue.length ) {
            this.emit( 'push', item );
            this.emit( 'push-queue', item );

            if ( item.isLeft() ) {
                this.queue.shift().resolve( { done: false, value: item.getLeft() } );
            } else {
                this.queue.shift().reject( item.getRight() );
            }

            if ( this.returned && this.queue.length == 0 ) {
                this.returnFuture.resolve();

                this.returnFuture = null;
            }
        } else {
            if ( this.returned ) return;

            this.emit( 'push', item );
            this.emit( 'push-buffer', item );

            this.buffer.push( item );
        }
    }

    value ( value : T ) {
        this.push( Either.left( value ) );
    }

    exception ( exception : any ) {
        this.push( Either.right( exception ) );
    }

    protected flush () {
        if ( this.buffer.length == 0 ) {
            for ( let future of this.queue ) {
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
        if ( this.buffer.length > 0 ) {
            const item = this.buffer.shift();

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

        this.queue.push( future );

        this.emit( 'pull-queue', value );
        this.emit( 'pull', value );

        return future.promise;
    }

    async return ( value ?: any ) : Promise<IteratorResult<T>> {
        if ( !this.returned ) this.emit( 'return' );

        this.returned = true;

        if ( this.queue.length == 0 ) {
            this.buffer = [];

            return { done: true, value };
        }

        if ( !this.returnFuture ) {
            this.returnFuture = new Future();
        }
        
        await this.returnFuture.promise;

        return { done: true, value };
    }
}

export function emits<T> () : AsyncIterableEmitter<T> {
    return new AsyncIterableEmitter<T>();
}