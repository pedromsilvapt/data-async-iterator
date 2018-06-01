import { Readable } from 'stream';
import { emits } from '../generators/emits';

export function fromStream<T> ( stream : Readable, chunkSize ?: number ) : AsyncIterable<T> {
    const emitter = emits<T>();

    let queued = false;

    let ended = false;

    stream.on( 'readable', () => {
        if ( queued ) {
            queued = false;

            read();
        }
    } );

    stream.on( 'end', () => ended = true );

    stream.on( 'error', err => {
        emitter.exception( err );
        emitter.end();
    } );

    const read = () => {
        const result = chunkSize ? stream.read( chunkSize ) : stream.read();

        if ( result == null ) {
            if ( ended ) {
                emitter.end();
            } else {
                queued = true;
            }
        } else {
            emitter.value( result );
        }
    };

    emitter.on( 'pull-queue', () => {
        if ( !queued ) {
            read();
        }
    } );

    return emitter;
}

export function fromWriteableStream<T> () {

}