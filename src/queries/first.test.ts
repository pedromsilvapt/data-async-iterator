import test from 'blue-tape';
import { throwIf } from '../errors/throwIf';
import { first } from './first';

test( '#first', t => {
    t.test( 'empty list', async t => {
        const value = await first( [], true );

        t.equal( value.isPresent(), false );
    } );

    t.test( 'finite list', async t => {
        const value = await first( [ 1, 2, 3, 4, 5 ], true );

        t.equal( value.isPresent(), true );
        t.equal( value.get(), 1 );
    } );

    t.test( 'promise should be rejected when an error is found', async t => {
        await t.shouldFail( first( throwIf( [ new Error( 'first' ) ] ), true ), 'first' );
    } );
} );