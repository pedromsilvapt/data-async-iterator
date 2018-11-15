import test from 'blue-tape';
import { dup } from './shared';
import { toArray } from '../reducers/toArray';

test( '#shared', t => {
    t.test( 'duplicated parallel', async t => {
        const [ first, second ] = dup( [ 1, 2, 3, 4 ] );

        const result = await Promise.all( [ toArray( first ), toArray( second ) ] );

        t.deepLooseEqual( result, [ [ 1, 2, 3, 4 ], [ 1, 2, 3, 4 ] ] );
    } );

    t.test( 'duplicated sequential', async t => {
        const [ first, second ] = dup( [ 1, 2, 3, 4 ] );

        t.deepLooseEqual( await toArray( first ), [ 1, 2, 3, 4 ] );
        t.deepLooseEqual( await toArray( second ), [ 1, 2, 3, 4 ] );
    } );

    t.test( 'multiple iterations', async t => {
        const [ first, second ] = dup( [ 1, 2, 3, 4 ] );

        t.deepLooseEqual( await toArray( first ), [ 1, 2, 3, 4 ] );
        t.deepLooseEqual( await toArray( first ), [ 1, 2, 3, 4 ] );
    } );
} );
