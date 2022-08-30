// Various Errors that can occur during processing.

import type { ImportTypeContextMap, ImportTypeDataMap } from "../../import-types/common/types";
import type { ImportTypes } from "tachi-common";

export type FailureTypes = "Internal" | "InvalidScore" | "KTDataNotFound" | "SkipScore";

export class ConverterFailure extends Error {
	message: string;
	failureType: FailureTypes;

	constructor(message: string, failureType: FailureTypes) {
		super();
		this.message = message;

		// @hack
		// Typescript sometimes decides to "compile out" prototype chains like this.
		// This creates problems for things like `instanceof`, which will
		// (seemingly randomly) stop working properly. Since we can't use instanceof
		// to stably assert what kind of error was thrown, we use a tagged string
		// instead.
		this.failureType = failureType;
	}
}

/**
 * SkipScoreFailure - This score could not be processed because we do not
 * support it. This is not an error, but is not a success either.
 * An example scenario would be something like a 5KEY score being imported from SSS.
 */
export class SkipScoreFailure extends ConverterFailure {
	constructor(message: string) {
		super(message, "SkipScore");
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
		super(message, "KTDataNotFound");

		this.importType = importType;
		this.data = data;
		this.converterContext = context;
	}
}

/**
 * InvalidScoreError - This score provided invalid data that we
 * can not accept.
 */
export class InvalidScoreFailure extends ConverterFailure {
	constructor(message: string) {
		super(message, "InvalidScore");
	}
}

/**
 * KTInternalFailure - An unexpected, internal error has occured,
 * and the score could not be processed.
 */
export class InternalFailure extends ConverterFailure {
	constructor(message: string) {
		super(message, "Internal");
	}
}

export function IsConverterFailure(err: ConverterFailure | Error): err is ConverterFailure {
	return "failureType" in err;
}
