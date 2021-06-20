// Various Errors that can occur during processing.

// @todo #116 Resolve circular dependency between converter-failures.ts and import-types/common/types.
import { ImportTypes } from "tachi-common";
import { ImportTypeDataMap, ImportTypeContextMap } from "../../import-types/common/types";

export class ConverterFailure {
	message: string | null;

	constructor(message: string | null) {
		this.message = message;
	}
}

/**
 * SkipScoreFailure - This score could not be processed because we do not
 * support it. This is not an error, but is not a success either.
 * An example scenario would be something like a 5KEY score being imported from SSS.
 */
export class SkipScoreFailure extends ConverterFailure {}

/**
 * KTDataNotFoundError - We could not find the song or chart this score
 * belongs to. The identifier used to try and match this chart is stored here.
 * Alongside any other fields used in the query.
 */
export class KTDataNotFoundFailure<T extends ImportTypes> extends ConverterFailure {
	data: ImportTypeDataMap[T];
	converterContext: ImportTypeContextMap[T];
	importType: T;

	constructor(
		message: string | null,
		importType: T,
		data: ImportTypeDataMap[T],
		context: ImportTypeContextMap[T]
	) {
		super(message);

		this.importType = importType;
		this.data = data;
		this.converterContext = context;
	}
}

/**
 * InvalidScoreError - This score provided invalid data that we
 * can not accept.
 */
export class InvalidScoreFailure extends ConverterFailure {}

/**
 * KTInternalFailure - An unexpected, internal error has occured,
 * and the score could not be processed.
 */
export class InternalFailure extends ConverterFailure {}
