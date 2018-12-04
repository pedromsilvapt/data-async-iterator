import test from 'blue-tape';
import { throwIf } from '../errors/throwIf';
import { pick } from './pick';

test( '#pick', t => {
    t.test( 'empty list', async t => {
        const value = await pick( [], 3, true );

        t.equal( value.isPresent(), false );
    } );

    t.test( 'short list', async t => {
        const value = await pick( [ 1, 2, 3 ], 3, true );

        t.equal( value.isPresent(), false );
    } );

    t.test( 'finite list', async t => {
        const value = await pick( [ 1, 2, 3, 4, 5 ], 3, true );

        t.equal( value.isPresent(), true );
        t.equal( value.get(), 4 );
    } );

    t.test( 'promise should be rejected when an error is found', async t => {
        await t.shouldFail( pick( throwIf( [ new Error( 'pick' ) ] ), 0, true ), 'pick' );
    } );
} );