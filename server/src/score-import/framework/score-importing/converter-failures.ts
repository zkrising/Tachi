// Various Errors that can occur during processing.

import { Converters } from "../../import-types/import-types";

export class ConverterFailure {
    message: string | null;

    constructor(message: string | null) {
        this.message = message;
    }
}

/**
 * KTDataNotFoundError - We could not find the song or chart this score
 * belongs to. The identifier used to try and match this chart is stored here.
 * Alongside any other fields used in the query.
 */
export class KTDataNotFoundFailure<T extends keyof typeof Converters> extends ConverterFailure {
    data: Parameters<typeof Converters[T]>[0];
    converterContext: Parameters<typeof Converters[T]>[1];
    importType: T;

    constructor(
        message: string | null,
        importType: T,
        data: Parameters<typeof Converters[T]>[0],
        context: Parameters<typeof Converters[T]>[1]
    ) {
        super(message);

        this.importType = importType;
        this.data = data;
        this.converterContext = context;
    }
}

/**
 * InvalidScoreError - This score provided invalid data that Kamaitachi
 * can not accept.
 */
export class InvalidScoreFailure extends ConverterFailure {}

/**
 * KTInternalFailure - An unexpected, internal error has occured,
 * and the score could not be processed.
 */
export class InternalFailure extends ConverterFailure {}
