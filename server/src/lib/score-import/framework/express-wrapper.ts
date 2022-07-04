import { MakeScoreImport } from "./score-import";
import ScoreImportFatalError from "./score-importing/score-import-error";
import CreateLogCtx from "lib/logger/logger";
import { Random20Hex } from "utils/misc";
import type { ParserArguments } from "../worker/types";
import type {
	ImportDocument,
	ImportTypes,
	integer,
	SuccessfulAPIResponse,
	UnsuccessfulAPIResponse,
} from "tachi-common";

export interface WrappedAPIResponse {
	statusCode: number;
	body: SuccessfulAPIResponse<ImportDocument> | UnsuccessfulAPIResponse;
}

const logger = CreateLogCtx(__filename);

/**
 * A thin(ish) wrapper for ScoreImportMain which converts thrown
 * errors and import documents into a WrappedAPIResponse, which can
 * be immediately sent with res.json().
 */
export async function ExpressWrappedScoreImportMain<I extends ImportTypes>(
	userID: integer,
	userIntent: boolean,
	importType: I,
	parserArguments: ParserArguments<I>
): Promise<WrappedAPIResponse> {
	const importID = Random20Hex();

	logger.debug("Received import request.");

	try {
		const res = await MakeScoreImport({
			importID,
			importType,
			userIntent,
			userID,
			parserArguments,
		});

		return {
			statusCode: 200,
			body: {
				success: true,
				description: "Import successful.",
				body: res,
			},
		};
	} catch (err) {
		if (err instanceof ScoreImportFatalError) {
			logger.info(err.message);
			return {
				statusCode: err.statusCode,
				body: {
					success: false,
					description: err.message,
				},
			};
		}

		logger.error(err);
		return {
			statusCode: 500,
			body: {
				success: false,
				description: "An internal service error has occured. This has been reported!",
			},
		};
	}
}
