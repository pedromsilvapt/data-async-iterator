import tape from 'tape';

declare module 'blue-tape' {
    interface Test {
        shouldFail ( promise : Promise<any>, msg ?: string ) : Promise<void>;
        shouldFail ( promise : Promise<any>, exceptionExpected : RegExp | Function, msg ?: string ) : Promise<void>;
    }
}