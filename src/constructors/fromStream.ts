import { subject } from '../generators/subject';

export function fromStream<T> ( stream : NodeJS.ReadableStream, chunkSize ?: number ) : AsyncIterable<T> {
    const emitter = subject<T>();

    let queued = false;

    let ended = false;

    stream.on( 'readable', () => {
        if ( queued ) {
            queued = false;

            read();
        }
    } );

    stream.on( 'end', () => {
        ended = true;

        if ( queued ) {
            queued = false;

            read();
        }
    } );

    stream.on( 'error', err => {
        emitter.pushException( err );
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
            emitter.pushValue( result as any as T );
        }
    };

    emitter.on( 'pull-queue', () => {
        if ( !queued ) {
            read();
        }
    } );

    return emitter;
}
