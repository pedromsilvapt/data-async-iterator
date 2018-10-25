import test from 'blue-tape';
import { throwIf } from './throwIf';
import { mapEither } from './mapEither';
import { Either } from '@pedromsilva/data-either';

test( 'mapEither', async t => {
    const iterable = mapEither( throwIf( [ 1, new Error( 'mapEither' ), 2 ] ) );

    const iterator = iterable[ Symbol.asyncIterator ]();

    let result = await iterator.next();

    t.equal( result.done, false );
    t.assert( result.value instanceof Either );
    t.assert( result.value.isLeft() );
    t.deepLooseEqual( result.value.getLeft(), 1 );

    
    result = await iterator.next();

    t.equal( result.done, false );
    t.assert( result.value instanceof Either );
    t.assert( result.value.isRight() );
    t.assert( result.value.getRight() instanceof Error );
    t.deepLooseEqual( result.value.getRight().message, 'mapEither' );

    
    result = await iterator.next();

    t.equal( result.done, false );
    t.assert( result.value instanceof Either );
    t.assert( result.value.isLeft() );
    t.deepLooseEqual( result.value.getLeft(), 2 );

    t.deepLooseEqual( await iterator.next(), { done: true, value: void 0 } );
} );