// Various Errors that can occur during processing.

import type { ImportTypeContextMap, ImportTypeDataMap } from "../../import-types/common/types";
import type { ImportTypes } from "tachi-common";

export class ConverterFailure extends Error {
	message: string;

	constructor(message: string) {
		super();
		this.message = message;

		Object.setPrototypeOf(this, ConverterFailure);
	}
}

/**
 * SkipScoreFailure - This score could not be processed because we do not
 * support it. This is not an error, but is not a success either.
 * An example scenario would be something like a 5KEY score being imported from SSS.
 */
export class SkipScoreFailure extends ConverterFailure {
	constructor(message: string) {
		super(message);

		// @hack
		// Typescript sometimes decides to "compile out" prototype chains like this
		// we have to *enforce* that these classes have the right inheritance,
		// because we do instanceof checks to determine what kind of error was
		// thrown. We could switch to a tagged union approach, but this seems more stable.
		Object.setPrototypeOf(this, SkipScoreFailure);
	}
}

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
		message: string,
		importType: T,
		data: ImportTypeDataMap[T],
		context: ImportTypeContextMap[T]
	) {
		super(message);

		this.importType = importType;
		this.data = data;
		this.converterContext = context;

		Object.setPrototypeOf(this, KTDataNotFoundFailure);
	}
}

/**
 * InvalidScoreError - This score provided invalid data that we
 * can not accept.
 */
export class InvalidScoreFailure extends ConverterFailure {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, InvalidScoreFailure);
	}
}

/**
 * KTInternalFailure - An unexpected, internal error has occured,
 * and the score could not be processed.
 */
export class InternalFailure extends ConverterFailure {
	constructor(message: string) {
		super(message);

		Object.setPrototypeOf(this, InternalFailure);
	}
}
