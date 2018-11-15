import { dynamic } from "../constructors/dynamic";
import { AsyncIterableLike } from "../core";

export class IterablesLinkIncomplete<S> {
    state : S;
    missing : number;

}

export class LinkedIterables<S> {
    protected factory : ( index : number ) => S;
    protected statesOffset : number = 0;
    protected states : IterablesLinkIncomplete<S>[] = [];
    protected preloaders : Function[] = [];
    
    connections : number = 0;
    
    public keepLastState : boolean = true;

    constructor ( factory : () => S, keepLastState : boolean = false ) {
        this.factory = factory;
        this.keepLastState = keepLastState;
    }

    protected createPreloader<T> ( fn : ( state : S ) => AsyncIterable<T> ) : ( state : S ) => AsyncIterable<T> {
        return state => {
            return fn( state );
        };
    }

    /**
     * Create a linked iterable. Every time the returned iterable is iterated upon, it will either create a new state, or use a state created by the corresponding iterator.
     * When preload is true, the first iterable that is iterated also creates all other iterators marked as preload, and caches them to return them when needed
     * 
     * @param iterableFn 
     * @param preload 
     */
    create<T> ( iterableFn : AsyncIterableLike<T> | ( ( state : S ) => AsyncIterableLike<T> ), preload : boolean = false ) : AsyncIterable<T> {
        this.connections++;

        let index = this.statesOffset;

        let preloaded : AsyncIterableLike<T>[] = preload ? [] : null;

        let thisPreloader : Function = null;

        const fn = () => {
            let thisIndex = index++;

            if ( thisIndex >= this.states.length + this.statesOffset ) {
                this.states.push( { state: this.factory( thisIndex ), missing: this.connections } );

                for ( let preloader of this.preloaders ) {
                    // To prevent infinite recursion and a stack overflow error
                    if ( preloader != thisPreloader ) {
                        preloader();
                    }
                }
            }

            this.states[ thisIndex - this.statesOffset ].missing--;

            const state = this.states[ thisIndex - this.statesOffset ].state;

            if ( !this.keepLastState ) {
                while ( this.states.length > 0 && this.states[ 0 ].missing == 0 ) {
                    this.states.shift();

                    this.statesOffset++;
                }
            }

            return iterableFn instanceof Function
                ? iterableFn( state )
                : iterableFn;
        };

        if ( preload ) {
            this.preloaders.push( thisPreloader = () => preloaded.push( fn() ) );
        }

        return dynamic( () => {
            if ( preload && preloaded.length > 0 ) {
                return preloaded.shift();
            }

            return fn();
        } );
    }

    

    purge ( state : S ) {
        for ( let i = 0; i < this.states.length; i++ ) {
            if ( this.states[ i ].missing > 0 ) {
                break;
            }

            if ( this.states[ i ].state == state ) {
                this.states.splice( i--, 1 );

                this.statesOffset++;
            }
        }
    }
}
