import test from 'blue-tape';
import { find, findLast } from './find';
import { throwIf } from '../errors/throwIf';

test( '#find', t => {
    t.test( 'search for non existent item', async t => {
        const value = await find( [ 1, 2, 3, 4, 5 ], n => n == 0, true );

        t.equal( value.isPresent(), false );
    } );

    t.test( 'search for non existent item', async t => {
        const value = await find( [ 1, 2, 3, 4, 5 ], n => n % 2 == 0, true );

        t.equal( value.isPresent(), true );
        t.equal( value.get(), 2 );
    } );

    t.test( 'promise should be rejected when an error is found', async t => {
        await t.shouldFail( find( throwIf( [ new Error( 'find' ) ] ), n => n == null, true ), 'find' );
    } );
} );

test( '#findLast', t => {
    t.test( 'search for non existent item', async t => {
        const value = await findLast( [ 1, 2, 3, 4, 5 ], n => n == 0, true );

        t.equal( value.isPresent(), false );
    } );

    t.test( 'search for non existent item', async t => {
        const value = await findLast( [ 1, 2, 3, 4, 5 ], n => n % 2 == 0, true );

        t.equal( value.isPresent(), true );
        t.equal( value.get(), 4 );
    } );

    t.test( 'promise should be rejected when an error is found', async t => {
        await t.shouldFail( findLast( throwIf( [ new Error( 'find' ) ] ), n => n == null, true ), 'find' );
    } );
} );