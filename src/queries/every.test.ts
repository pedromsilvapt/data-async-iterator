import test from 'blue-tape';
import { every } from './every';

test( '#every', t => {
    t.test( 'empty list always returns true', async t => {
        t.equal( await every( [], () => false ), true );
    } );

    t.test( 'list that should return true', async t => {
        t.equal( await every( [ 2, 4, 6 ], n => n % 2 == 0 ), true );
    } );

    t.test( 'list that should return false', async t => {
        t.equal( await every( [ 2, 4, 5 ], n => n % 2 == 0 ), false );
    } );
} );