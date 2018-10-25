import { map } from "../transformers/map";
import { Either } from "@pedromsilva/data-either";
import { AsyncIterableLike } from "../core";
import { mapErrors } from "./mapErrors";

export function mapEither<T, E = any> ( iterable : AsyncIterableLike<T> ) : AsyncIterable<Either<T, E>> {
    return mapErrors( map( iterable, value => Either.left<T, E>( value ) ), err => Either.right<T, E>( err ) );
}