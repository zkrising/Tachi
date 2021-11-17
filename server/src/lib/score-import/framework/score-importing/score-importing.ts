import db from "external/mongo/db";
import { AppendLogCtx, KtLogger } from "lib/logger/logger";
import { ScoreImportJob } from "lib/score-import/worker/types";
import {
	ChartDocument,
	Game,
	IDStrings,
	ImportProcessingInfo,
	ImportTypes,
	integer,
	ScoreDocument,
	SongDocument,
} from "tachi-common";
import {
	ConverterFnReturnOrFailure,
	ConverterFnSuccessReturn,
	ConverterFunction,
} from "../../import-types/common/types";
import {
	ConverterFailure,
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
	SkipScoreFailure,
} from "../common/converter-failures";
import { DryScore } from "../common/types";
import { OrphanScore } from "../orphans/orphans";
import { HydrateScore } from "./hydrate-score";
import { GetScoreQueueMaybe, InsertQueue, QueueScoreInsert } from "./insert-score";
import { CreateScoreID } from "./score-id";

/**
 * Processes the iterable data into the Tachi database.
 * @param userID - The user this score import was for.
 * @param iterableData - The data to iterate upon.
 * @param ConverterFunction - The function needed to convert the data into an IntermediateScore
 * @param context - Any context the Converter may need in order to make decisions.
 * @returns An array of ImportProcessInfo objects.
 */
export async function ImportAllIterableData<D, C>(
	userID: integer,
	importType: ImportTypes,
	iterableData: Iterable<D> | AsyncIterable<D>,
	ConverterFunction: ConverterFunction<D, C>,
	context: C,
	game: Game,
	logger: KtLogger,
	job: ScoreImportJob | undefined
): Promise<ImportProcessingInfo[]> {
	logger.verbose("Getting Blacklist...");

	// @optimisable: could filter harder with score.game and score.playtype
	// stuff.
	const blacklist = (
		await db["score-blacklist"].find({
			userID,
		})
	).map((e) => e.scoreID);

	logger.verbose(`Starting Data Processing...`);

	const processedResults = [];

	let i = 0;

	// for await is used here as iterableData may be an async iterable
	// An example would be making an api request after exhausting
	// the first set of data.
	for await (const data of iterableData) {
		processedResults.push(
			await ImportIterableDatapoint(
				userID,
				importType,
				data,
				ConverterFunction,
				context,
				game,
				blacklist,
				logger
			)
		);

		i++;

		if (job) {
			job.progress({ description: `Imported ${i} scores.` });
		}
	}

	// We need to filter out nulls, which we don't care for (these are neither successes or failures)

	logger.verbose(`Finished Importing Data (${processedResults.length} datapoints).`);
	logger.debug(`Removing null returns...`);

	const datapoints = processedResults.filter(
		(e) => e !== null
	) as ImportProcessingInfo<IDStrings>[];

	logger.debug(`Removed null from results.`);

	logger.verbose(`Recieved ${datapoints.length} returns, from ${processedResults.length} data.`);

	// Flush the score queue out after finishing most of the import. This ensures no scores get left in the
	// queue.
	const emptied = await InsertQueue(userID);

	if (emptied) {
		logger.verbose(`Emptied ${emptied} documents from score queue.`);
	}

	return datapoints;
}

/**
 * Processes a single data object into one or many ImportProcessingInfo objects.
 * @param userID - The user this score is from.
 * @param data - The data to process.
 * @param ConverterFunction - The processor function that takes the data and returns the partialScore(s)
 * @param context - Any context the processor might need that it can not infer from the data object.
 * @returns An array of ImportProcessingInfo objects, or a single ImportProcessingInfo object
 */
export async function ImportIterableDatapoint<D, C>(
	userID: integer,
	importType: ImportTypes,
	data: D,
	ConverterFunction: ConverterFunction<D, C>,
	context: C,
	game: Game,
	blacklist: string[],
	logger: KtLogger
): Promise<ImportProcessingInfo | null> {
	// Converter Function Return
	let cfnReturn: ConverterFnReturnOrFailure;

	try {
		cfnReturn = await ConverterFunction(data, context, importType, logger);
	} catch (err) {
		cfnReturn = err as ConverterFailure | Error;
	}

	// if this conversion failed, return it in the proper format
	if (cfnReturn instanceof ConverterFailure) {
		if (cfnReturn instanceof KTDataNotFoundFailure) {
			logger.info(`KTDataNotFoundFailure: ${cfnReturn.message ?? "No message?"}`, {
				cfnReturn,
				hideFromConsole: ["cfnReturn"],
			});

			logger.debug("Inserting orphan...", { cfnReturn });

			const insertOrphan = await OrphanScore(
				cfnReturn.importType,
				userID,
				cfnReturn.data,
				cfnReturn.converterContext,
				cfnReturn.message,
				game,
				logger
			);

			if (insertOrphan.success) {
				logger.debug("Orphan inserted successfully.", { orphanID: insertOrphan.orphanID });
				return {
					success: false,
					type: "KTDataNotFound",
					message: cfnReturn.message,
					content: {
						context: cfnReturn.converterContext,
						data: cfnReturn.data,
						orphanID: insertOrphan.orphanID,
					},
				};
			}

			logger.debug(`Orphan already exists.`, { orphanID: insertOrphan.orphanID });

			return {
				success: false,
				type: "OrphanExists",
				message: cfnReturn.message,
				content: {
					orphanID: insertOrphan.orphanID,
				},
			};
		} else if (cfnReturn instanceof InvalidScoreFailure) {
			logger.info(`InvalidScoreFailure: ${cfnReturn.message ?? "No message?"}`, {
				cfnReturn,
				hideFromConsole: ["cfnReturn"],
			});
			return {
				success: false,
				type: "InvalidDatapoint",
				message: cfnReturn.message,
				content: {},
			};
		} else if (cfnReturn instanceof InternalFailure) {
			logger.error(`Internal error occured.`, { cfnReturn });
			return {
				success: false,
				type: "InternalError",
				// could return cfnReturn.message here, but we might want to hide the details of the crash.
				message: "An internal error has occured.",
				content: {},
			};
		} else if (cfnReturn instanceof SkipScoreFailure) {
			return null;
		} else {
			logger.warn(`Unknown error returned as ConverterFailure, Ignoring.`, {
				err: cfnReturn,
			});
			return {
				success: false,
				type: "InternalError",
				message: "An internal service error has occured.",
				content: {},
			};
		}
	}

	if (cfnReturn instanceof Error) {
		logger.error(`Unknown error thrown from converter, Ignoring.`, {
			err: cfnReturn,
		});
		return {
			success: false,
			type: "InternalError",
			message: "An internal service error has occured.",
			content: {},
		};
	}

	return ProcessSuccessfulConverterReturn(
		userID,
		cfnReturn as ConverterFnSuccessReturn,
		blacklist,
		logger
	);
}

export async function ProcessSuccessfulConverterReturn(
	userID: integer,
	cfnReturn: ConverterFnSuccessReturn,
	blacklist: string[],
	logger: KtLogger,
	forceImmediateImport = false
): Promise<ImportProcessingInfo | null> {
	const result = await HydrateAndInsertScore(
		userID,
		cfnReturn.dryScore,
		cfnReturn.chart,
		cfnReturn.song,
		blacklist,
		logger,
		forceImmediateImport
	);

	// This used to be a ScoreExists error. However, we never actually care about
	// handling ScoreExists errors (they're nobodies issue)
	// so instead, the function will just return null, and we pass that on here.
	if (result === null) {
		return null;
	}

	logger.debug(`Successfully imported score: ${result.scoreID}`);

	return {
		success: true,
		type: "ScoreImported",
		message: null,
		content: {
			score: result,
		},
	};
}

/**
 * Hydrates and inserts a score to the Tachi database.
 * @param userID - The user this score is from.
 * @param dryScore - The score that is to be hydrated and inserted.
 * @param chart - The chart this score is on.
 * @param song - The song this score is on.
 * @param blacklist - A list of ScoreIDs to never write to the database.
 *
 * @param force - Whether to immediately insert the score into the database
 * or not.
 */
async function HydrateAndInsertScore(
	userID: integer,
	dryScore: DryScore,
	chart: ChartDocument,
	song: SongDocument,
	blacklist: string[],
	importLogger: KtLogger,
	force = false
): Promise<ScoreDocument | null> {
	const scoreID = CreateScoreID(userID, dryScore, chart.chartID);

	// sub-context the logger so the below logs are more accurate
	const logger = AppendLogCtx(scoreID, importLogger);

	if (blacklist.length && blacklist.includes(scoreID)) {
		logger.verbose("Skipped score, as it was on the blacklist.");
		return null;
	}

	const existingScore = await db.scores.findOne(
		{
			scoreID,
		},
		{
			// micro-optimisation - mongoDB is significantly faster when returning less fields
			// since we only care about whether we have a score or not here, we can minimise returned
			// fields.
			//
			// feel free to test this yourself! - zkldi (09/04/2021)
			projection: {
				_id: 1,
			},
		}
	);

	if (existingScore) {
		logger.verbose(`Skipped score.`);
		return null;
	}

	// If this users score queue
	if (GetScoreQueueMaybe(userID)?.scoreIDSet.has(scoreID)) {
		logger.verbose(`Skipped score.`);
		return null;
	}

	const score = await HydrateScore(userID, dryScore, chart, song, scoreID, logger);

	let res;
	if (force) {
		res = await db.scores.insert(score);
	} else {
		res = await QueueScoreInsert(score);
	}

	// this is a last resort for avoiding doubled imports
	if (res === null) {
		logger.verbose(`Skipped score - Race Condition protection triggered.`);
		return null;
	}

	return score;
}
