import { Router } from "express";
import { APIImportTypes, FileUploadImportTypes, integer } from "tachi-common";
import Prudence from "prudence";
import { GetUserWithIDGuaranteed } from "utils/user";
import CreateLogCtx, { KtLogger } from "lib/logger/logger";
import prValidate from "server/middleware/prudence-validate";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { SIXTEEN_MEGABTYES } from "lib/constants/filesize";
import { ExpressWrappedScoreImportMain } from "lib/score-import/framework/express-wrapper";
import { CreateMulterSingleUploadMiddleware } from "server/middleware/multer-upload";

import ParseEamusementIIDXCSV from "lib/score-import/import-types/file/eamusement-iidx-csv/parser";
import ParseBatchManual from "lib/score-import/import-types/file/batch-manual/parser";
import { ParseSolidStateXML } from "lib/score-import/import-types/file/solid-state-squad/parser";
import { ParseMerIIDX } from "lib/score-import/import-types/file/mer-iidx/parser";
import ParsePLIIIDXCSV from "lib/score-import/import-types/file/pli-iidx-csv/parser";
import { ServerTypeInfo } from "lib/setup/config";
import { RequirePermissions } from "server/middleware/auth";
import { ParseEagIIDX } from "lib/score-import/import-types/api/eag-iidx/parser";
import { ParseEagSDVX } from "lib/score-import/import-types/api/eag-sdvx/parser";
import { ParseFloIIDX } from "lib/score-import/import-types/api/flo-iidx/parser";
import { ParseFloSDVX } from "lib/score-import/import-types/api/flo-sdvx/parser";
import { ParseMinSDVX } from "lib/score-import/import-types/api/min-sdvx/parser";
import { ParseArcSDVX } from "lib/score-import/import-types/api/arc-sdvx/parser";
import { ParseArcIIDX } from "lib/score-import/import-types/api/arc-iidx/parser";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

const ParseMultipartScoredata = CreateMulterSingleUploadMiddleware(
	"scoreData",
	SIXTEEN_MEGABTYES,
	logger
);

const fileImportTypes = ServerTypeInfo.supportedImportTypes.filter((e) => e.startsWith("file/"));

/**
 * Import scores from a file. Expects the post request to be multipart, and to provide a scoreData file.
 * @name POST /api/v1/import/file
 */
router.post(
	"/file",
	RequirePermissions("submit_score"),
	ParseMultipartScoredata,
	prValidate(
		{
			importType: Prudence.isIn(fileImportTypes),
		},
		{},
		{ allowExcessKeys: true }
	),
	async (req, res) => {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				description: `No file provided.`,
			});
		}

		const importType = req.body.importType as FileUploadImportTypes;

		const inputParser = (logger: KtLogger) =>
			ResolveFileUploadData(importType, req.file!, req.body, logger);

		const userDoc = await GetUserWithIDGuaranteed(req.session.tachi!.user.id);

		// The <any, any> here is deliberate - TS picks the IIDX-CSV generic values
		// for this function call because it sees them first
		// but that is ABSOLUTELY not what is actually occuring.
		// We use this as an override because we know better.
		// see: https://www.typescriptlang.org/play?ts=4.3.0-beta#code/GYVwdgxgLglg9mABAQQDwBUB8AKYc4BciAYvhpgJSIDeiAsAFCKID0LiAJnAKYDOivKCGDBGAX0aMYYKNwBOwAIYRuJMlhqNmzAEaK5RdOMkNQkWAkQAlbkLlgAynAC23UnGxVqW7W0QAHOVtuMA5EKAALGH5o8IjVIN4QABsoRDhgARdVaX8QNOlBbkUwjMQ5RVCXH2YYTOwAWUVIgDoKqudPRFREAAYWgFYvGu1mILskWj0DRAAiQTlpAHNZxAkmbXXRkfGQexpEaaIARgAmAGY14wZGZNt0vfdEAF5rWz3HbPdPAG4TZGwcEe+AoPyAA
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const responseData = await ExpressWrappedScoreImportMain<any, any>(
			userDoc,
			true,
			importType,
			inputParser
		);

		return res.status(responseData.statusCode).json(responseData.body);
	}
);

const apiImportTypes = ServerTypeInfo.supportedImportTypes.filter((e) => e.startsWith("api/"));

/**
 * Import scores from another API. This typically will perform a full sync.
 * @name POST /api/v1/import/from-api
 */
router.post(
	"/from-api",
	RequirePermissions("submit_score"),
	prValidate(
		{
			importType: Prudence.isIn(apiImportTypes),
		},
		{},
		{ allowExcessKeys: true }
	),
	async (req, res) => {
		const importType = req.body.importType as APIImportTypes;

		const userDoc = await GetUserWithIDGuaranteed(req.session.tachi!.user.id);

		const inputParser = (logger: KtLogger) =>
			ResolveAPIImportParser(userDoc.id, importType, logger);

		// see the argument above about typescript falsely expanding types.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const responseData = await ExpressWrappedScoreImportMain<any, any>(
			userDoc,
			true,
			importType,
			inputParser
		);

		return res.status(responseData.statusCode).json(responseData.body);
	}
);

/**
 * Resolves the data from a file upload into an iterable,
 * The appropriate processing function to map that iterable over,
 * and and any context the processing may need (such as playtype)
 *
 * This also performs validation on the type of file uploaded.
 * @param importType - The type of import request this was.
 * @param fileData - The data sent by the user.
 * @param body - Other data passed by the user in the request body.
 */
export function ResolveFileUploadData(
	importType: FileUploadImportTypes,
	fileData: Express.Multer.File,
	body: Record<string, unknown>,
	logger: KtLogger
) {
	switch (importType) {
		case "file/eamusement-iidx-csv":
			return ParseEamusementIIDXCSV(fileData, body, logger);
		case "file/pli-iidx-csv":
			return ParsePLIIIDXCSV(fileData, body, logger);
		case "file/batch-manual":
			return ParseBatchManual(fileData, body, logger);
		case "file/solid-state-squad":
			return ParseSolidStateXML(fileData, body, logger);
		case "file/mer-iidx":
			return ParseMerIIDX(fileData, body, logger);
		default:
			logger.error(
				`importType ${importType} made it into ResolveFileUploadData, but should have been rejected by Prudence.`
			);
			throw new ScoreImportFatalError(400, `Invalid importType of ${importType}.`);
	}
}

export function ResolveAPIImportParser(
	userID: integer,
	importType: APIImportTypes,
	logger: KtLogger
) {
	switch (importType) {
		case "api/eag-iidx":
			return ParseEagIIDX(userID, logger);
		case "api/eag-sdvx":
			return ParseEagSDVX(userID, logger);
		case "api/flo-iidx":
			return ParseFloIIDX(userID, logger);
		case "api/flo-sdvx":
			return ParseFloSDVX(userID, logger);
		case "api/min-sdvx":
			return ParseMinSDVX(userID, logger);
		case "api/arc-iidx":
			return ParseArcIIDX(userID, logger);
		case "api/arc-sdvx":
			return ParseArcSDVX(userID, logger);
		default:
			logger.error(`Unknown importType ${importType} has no handler?`);
			throw new ScoreImportFatalError(500, `Unknown importType ${importType}.`);
	}
}

export default router;
