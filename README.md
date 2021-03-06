# Async Iterator

> Batteries-included utility functions to work with async iterables as available in ES2018/TypeScript

# Installation
```shell
npm install --save data-async-iterators
```

# Tips & Tricks
 - Iterators as lazy/pull-based
    - They only calculate the next value when it is requested; thus only calculating the values that are needed
 - Some methods require buffering values: be careful when mixing them with slow consumers
 - Iterators need consumers: since transformations are lazy, not consuming (subscribing) to an iterator means nothing happens
 - When manually using an iterator (calling `next()`), one should be careful to call `return()` on iterators that provide it as well, when the iterator is not needed anymore before it has ended, to allow it to free any resources it might be holding
 - Most operators return iterables. If provided with iterables as well, they can be iterated multiple times (instead of just once). Other iterators return iterators: these can only be iterated once
 - Most operators in this library accept `AsyncIterableLike<T>` instead of `AsyncIterable<T>`. This means certain rules apply:
    - `Iterable<T>`'s are transformed to `AsyncIterable<T>`'s;
    - `Iterator<T>`'s and `AsyncIetrator<T>`'s are transformed to `AsyncIterable<T>`'s that always return the same, original iterator;
    - `Promise<AsyncIterableLike<T>>`'s are converted to `AsyncIterable<T>`, waiting for the promise before using the resolved iterable;
    - The operator `fromPromise<T>( promise : Promise<T> )` returns an `AsyncIterable<T>` that only ever emits one value or one exception, whatever is resolved by the promise;

# Usage
Contains all the common utility functions like map, filter, takeWhile, flatMap, concat, and many more as well as more async-centric ones
like flatMapConcurrent, debounce, throttle, buffered, etc...

```typescript
import { from, delay, map, flatMapConcurrent } from 'data-async-iterators';

// Create an asynchonous iterable stream
const source = delay( from( [ 1, 2, 3, 4 ] ), 1000 );

// A closure that takes a number and slowly returns the number and it's square
const mapper = number => delay( from( [ number, number * number ] ), 4000 );

// Run mapper concurrently only twice
const flatMapConcurrent( source, mapper, 2 );

// And finally consume the values (returns a promise notifying when the iterator ends)
forEach( source, res => console.log( res ) );
```

Or maybe a more pratical example
```typescript
import { merge, map, forEach } from 'data-async-iterators';

function findDevices () : AsyncIterable<Device> { /* ... */ };

function connectDevice ( device : Device ) : AsyncIterable<DeviceStatus> { /* ... */ };

function processStatus ( status : DeviceStatus ) : Promise<void> { /* ... */ };

// Gets an async iterable of devices found
const devices : AsyncIterable<Device> = findDevices();

// For each iterable calls the connectDevice that returns an iterable documenting the statuses changes of each device
const statuses : AsyncIterable<DeviceStatus> = merge( map( devices, connectDevice ) );

// Consumes all 
forEach( statuses, processStatus );
```

Sometimes chaining functions in this way is not very readable, and therefore this package provides a utility class called `AsyncStream` that is a simple wraper around an iterable with all the operators as methods.

```typescript
import { AsyncStream } from 'data-async-iterators';

const stream = AsyncStream.range( 1, 10 )
    // Delay each number by 100 milliseconds
    .delay( 100 )
    // Double each number
    .map( v => v * 2 )
    // For each n number, generate n repetitions
    .flatMap( v => AsyncStream.repeat( v, v ) )
    // Ignore the first and last ten numbers
    .slice( 10, -10 );

// Since AsyncStream is a regular iterable, we can
for await ( let number of stream ) {
    console.log( number );
}

// Or
stream.forEach( number => console.log( number ) );

// To convert any regular AsyncIterable (or promises, regular iterables, arrays, etc...)
// into an AsyncStream just do:
const stream = new AsyncStream( iterable );
```
