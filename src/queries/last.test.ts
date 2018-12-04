import test from 'blue-tape';
import { throwIf } from '../errors/throwIf';
import { last } from './last';

test( '#last', t => {
    t.test( 'empty list', async t => {
        const value = await last( [], true );

        t.equal( value.isPresent(), false );
    } );

    t.test( 'finite list', async t => {
        const value = await last( [ 1, 2, 3, 4, 5 ], true );

        t.equal( value.isPresent(), true );
        t.equal( value.get(), 5 );
    } );

    t.test( 'promise should be rejected when an error is found', async t => {
        await t.shouldFail( last( throwIf( [ new Error( 'last' ) ] ), true ), 'last' );
    } );
} );