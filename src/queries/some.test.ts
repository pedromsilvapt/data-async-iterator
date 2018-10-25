import test from 'blue-tape';
import { some } from './some';

test( '#some', t => {
    t.test( 'empty list always returns false', async t => {
        t.equal( await some( [], () => true ), false );
    } );

    t.test( 'list that should return true', async t => {
        t.equal( await some( [ 2, 3, 6 ], n => n % 2 == 0 ), true );
    } );

    t.test( 'list that should return false', async t => {
        t.equal( await some( [ 1, 3, 5 ], n => n % 2 == 0 ), false );
    } );
} );