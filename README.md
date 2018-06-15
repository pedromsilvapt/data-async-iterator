# Async Iterator

> Utility functions to work with async iterables as available in ES2018/TypeScript

# Installation
```shell
npm install --save data-async-iterators
```

# Tips & Tricks
 - Iterators as lazy/pull-based
    - They only calculate the next value when it is requested
    - They only calculate the values that are needed
 - Some methods require buffering values: be careful when mixing them with slow consumers
 - Iterators need consumers: since transformations are lazy, not consuming (subscribing) to an iterator means nothing happens

# Usage
Contains all the common utility functions like map, filter, takeWhile, flatMap, concat, and many more as well as more async-centric ones
like flatMapConcurrent, debounce, throttle, buffered, etc...

```typescript
import { from, delay, map, flatMapConcurrent } from 'data-async-iterator';

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
import { merge, map, forEach } from 'data-async-iterator';

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

