import ScoreImportFatalError from "./score-import-error";
import { ImportAllIterableData } from "./score-importing";
import { Converters } from "../../import-types/converters";
import { InternalFailure } from "../common/converter-failures";
import { CreateScoreLogger } from "../common/import-logger";
import { GetAndUpdateUsersGoals } from "../goals/goals";
import { CheckAndSetOngoingImportLock, UnsetOngoingImportLock } from "../import-locks/lock";
import { ProcessPBs } from "../pb/process-pbs";
import { UpdateUsersQuests } from "../quests/quests";
import { CreateSessions } from "../sessions/sessions";
import { UpdateUsersGamePlaytypeStats } from "../user-game-stats/update-ugs";
import db from "external/mongo/db";
import { GetGameConfig } from "tachi-common";
import { GetMillisecondsSince } from "utils/misc";
import { GetUserWithID } from "utils/user";
import type { ConverterFunction, ImportInputParser } from "../../import-types/common/types";
import type { ChartIDPlaytypeMap, ScorePlaytypeMap } from "../common/types";
import type { ClassHandler } from "../user-game-stats/types";
import type { KtLogger } from "lib/logger/logger";
import type { ScoreImportJob } from "lib/score-import/worker/types";
import type {
	Game,
	IDStrings,
	ImportDocument,
	ImportProcessingInfo,
	ImportTypes,
	integer,
	Playtype,
	UserDocument,
} from "tachi-common";

/**
 * Performs a Score Import.
 *
 * If a job is passed, progress will be set throughout the job.
 */
export default async function ScoreImportMain<D, C>(
	userID: integer,
	userIntent: boolean,
	importType: ImportTypes,
	InputParser: ImportInputParser<D, C>,
	importID: string,
	providedLogger?: KtLogger,
	job?: ScoreImportJob
) {
	const user = await GetUserWithID(userID);

	if (!user) {
		throw new InternalFailure(
			`User with ID ${userID} does not exist, but attempted to make an import?`
		);
	}

	let logger;

	if (!providedLogger) {
		// If they weren't given to us -
		// we create an "import logger".
		// this holds a reference to the user's name, ID, and type
		// of score import for any future debugging.
		logger = CreateScoreLogger(user, importID, importType);
		logger.debug("Received import request.");
	} else {
		logger = providedLogger;
	}

	const hasNoOngoingImport = await CheckAndSetOngoingImportLock(user.id);

	if (hasNoOngoingImport) {
		logger.info(`User ${userID} made an import while they had one ongoing.`);

		// @danger
		// Throwing away an import if the user already has one outgoing is *bad*, as in the case
		// of degraded performance we might just start throwing scores away.
		// Under normal circumstances, there is no scenario where a user would have two ongoing
		// imports at the same time - even if they were using single-score imports on a 5 second
		// chart, as each score import takes only around ~10-15milliseconds.
		throw new ScoreImportFatalError(409, "This user already has an ongoing import.");
	}

	try {
		const timeStarted = Date.now();

		void SetJobProgress(job, "Parsing score data.");

		// --- 1. Parsing ---
		// We get an iterable from the provided parser function, alongside some context and a converter function.
		// This iterable does not have to be an array - it's anything that's iterable, like a generator.
		const parseTimeStart = process.hrtime.bigint();
		const { iterable, context, game, classHandler } = await InputParser(logger);

		const parseTime = GetMillisecondsSince(parseTimeStart);

		logger.debug(`Parsing took ${parseTime} milliseconds.`);

		void SetJobProgress(
			job,
			`Parsed Score Data. Took ${parseTime}ms. Importing ${
				Array.isArray(iterable) ? iterable.length : "an unknown amount of"
			} scores.`
		);

		// We have to cast here due to typescript generic confusions. This is guaranteed` to be correct.
		const ConverterFunction = Converters[importType] as unknown as ConverterFunction<D, C>;

		// --- 2. Importing ---
		// ImportAllIterableData iterates over the iterable, applying the converter function to each bit of data.
		const importTimeStart = process.hrtime.bigint();

		let importInfo;
		const startOfImportingScores = Date.now();

		// Score imports are not transaction based. As such, if they fail midway through, corrupt state
		// may occur. This sucks, but we can band-aid over some of the worse parts. Here, if our score
		// import fails, we **know** that we might've inserted scores but not properly handled their
		// state. If so, we should attempt to revert any of those scores.
		//
		// There are still places where Tachi can fail on importing scores and result in corrupt state,
		// but this band-aid fix handles all known cases of a partial-import failure.
		try {
			importInfo = await ImportAllIterableData(
				user.id,
				importType,
				iterable,
				ConverterFunction,
				context,
				game,
				logger,
				job
			);
		} catch (err) {
			logger.error(
				`An error was thrown from ImportAllIterableData, which has resulted in a potential partial-score-import. Undoing scores inserted from this import.`,
				{ err }
			);

			// Remove all scores from the database for this user which were imported after our timer started.
			const r = await db.scores.remove({
				userID: user.id,
				timeAdded: { $gte: startOfImportingScores },
			});

			logger.error(
				`Removed ${r.deletedCount} scores from the database to undo partial-import.`
			);

			throw err;
		}

		const importTime = GetMillisecondsSince(importTimeStart);
		const importTimeRel = importTime / importInfo.length;

		logger.debug(`Importing took ${importTime} milliseconds. (${importTimeRel}ms/doc)`);

		void SetJobProgress(job, `Imported scores, took ${importTime} milliseconds. `);

		// Steps 3-8 are handled inside here.
		// This was moved inside here so the score de-orphaning process
		// could hook into importing better
		const {
			playtypes,
			scoreIDs,
			errors,
			sessionInfo,
			classDeltas,
			goalInfo,
			questInfo,
			relativeTimes,
			absoluteTimes,
		} = await HandlePostImportSteps(
			importInfo,
			user,
			importType,
			game,
			classHandler,
			logger,
			job
		);

		const { importParseTimeRel, pbTimeRel, sessionTimeRel } = relativeTimes;
		const { importParseTime, sessionTime, pbTime, ugsTime, goalTime, questTime } =
			absoluteTimes;

		void SetJobProgress(job, "Finalising Import.");

		// --- 9. Finalise Import Document ---
		// Create and Save an import document to the database, and finish everything up!
		const ImportDocument: ImportDocument = {
			importType,
			idStrings: playtypes.map((e) => `${game}:${e}`) as Array<IDStrings>,
			scoreIDs,
			playtypes,
			game,
			errors,
			importID,
			timeFinished: Date.now(),
			timeStarted,
			createdSessions: sessionInfo,
			userID: user.id,
			classDeltas,
			goalInfo,
			questInfo,
			userIntent,
		};

		const logMessage = `Import took: ${ImportDocument.timeFinished - timeStarted}ms, with ${
			importInfo.length
		} documents (Fails: ${errors.length}, Successes: ${scoreIDs.length}, Sessions: ${
			sessionInfo.length
		}). Aprx ${(ImportDocument.timeFinished - timeStarted) / importInfo.length}ms/doc`;

		// I only really want to log "big" imports. The others are here for debugging purposes.
		if (scoreIDs.length > 500) {
			logger.info(logMessage);
		} else if (scoreIDs.length > 1) {
			logger.verbose(logMessage);
		} else {
			logger.debug(logMessage);
		}

		await db.imports.insert(ImportDocument);

		// we don't await this because we don't
		// particularly care about waiting for it.
		void db["import-timings"].insert({
			importID,
			timestamp: Date.now(),
			total: ImportDocument.timeFinished - timeStarted,
			rel: {
				import: importTimeRel,
				importParse: importParseTimeRel,
				pb: pbTimeRel,
				session: sessionTimeRel,
			},
			abs: {
				parse: parseTime,
				import: importTime,
				importParse: importParseTime,
				session: sessionTime,
				pb: pbTime,
				ugs: ugsTime,
				goal: goalTime,
				quest: questTime,
			},
		});

		return ImportDocument;
	} finally {
		await UnsetOngoingImportLock(user.id);
	}
}

/**
 * Handles every single processing step after actually loading scores
 * into the database, such as updating goals, reprocessing sessions,
 * and updating a users game stats.
 */
export async function HandlePostImportSteps(
	importInfo: Array<ImportProcessingInfo>,
	user: UserDocument,
	importType: ImportTypes,
	game: Game,
	classHandler: ClassHandler | null,
	logger: KtLogger,
	job: ScoreImportJob | undefined
) {
	// --- 3. ParseImportInfo ---
	// ImportInfo is a relatively complex structure. We need some information from it for subsequent steps
	// such as the list of chartIDs involved in this import.
	const importParseTimeStart = process.hrtime.bigint();
	const { scorePlaytypeMap, errors, scoreIDs, chartIDs } = ParseImportInfo(importInfo);

	const importParseTime = GetMillisecondsSince(importParseTimeStart);
	const importParseTimeRel = importParseTime / importInfo.length;

	logger.debug(
		`Import Parsing took ${importParseTime} milliseconds. (${importParseTimeRel}ms/doc)`
	);

	void SetJobProgress(job, "Inserting Sessions.");

	// --- 4. Sessions ---
	// We create (or update existing) sessions here. This uses the aforementioned parsed import info
	// to determine what goes where.
	const sessionTimeStart = process.hrtime.bigint();
	const sessionInfo = await CreateSessions(user.id, importType, game, scorePlaytypeMap, logger);

	const sessionTime = GetMillisecondsSince(sessionTimeStart);
	const sessionTimeRel = sessionTime / sessionInfo.length;

	logger.debug(`Session Processing took ${sessionTime} milliseconds (${sessionTimeRel}ms/doc).`);

	void SetJobProgress(job, "Processing scores and updating PBs.");

	const playtypes = Object.keys(scorePlaytypeMap) as Array<Playtype>;

	// --- 5. PersonalBests ---
	// We want to keep an updated reference of a users best score on a given chart.
	// This function also handles conjoining different scores together (such as unioning best lamp and
	// best score).
	const pbTimeStart = process.hrtime.bigint();

	// processing PBs is a playtype-specific action. As such, we need to split chartIDs
	// accordingly
	const chartIDsSeparatedByPlaytype: ChartIDPlaytypeMap = {};

	for (const [playtype, scores] of Object.entries(scorePlaytypeMap)) {
		chartIDsSeparatedByPlaytype[playtype as Playtype] = new Set(scores.map((e) => e.chartID));
	}

	await Promise.all(
		Object.entries(chartIDsSeparatedByPlaytype).map(([playtype, chartIDs]) =>
			ProcessPBs(game, playtype as Playtype, user.id, chartIDs, logger)
		)
	);

	const pbTime = GetMillisecondsSince(pbTimeStart);
	const pbTimeRel = pbTime / chartIDs.size;

	logger.debug(`PB Processing took ${pbTime} milliseconds (${pbTimeRel}ms/doc)`);

	void SetJobProgress(job, "Updating profile statistics.");

	// --- 6. Game Stats ---
	// This function updates the users "stats" for this game - such as their profile rating or their classes.
	const ugsTimeStart = process.hrtime.bigint();
	const classDeltas = await UpdateUsersGameStats(game, playtypes, user.id, classHandler, logger);

	const ugsTime = GetMillisecondsSince(ugsTimeStart);

	logger.debug(`UGS Processing took ${ugsTime} milliseconds.`);

	void SetJobProgress(job, "Updating Goals.");

	// --- 7. Goals ---
	// Evaluate and update the users goals. This returns information about goals that have changed.
	const goalTimeStart = process.hrtime.bigint();
	const goalInfo = await GetAndUpdateUsersGoals(game, user.id, chartIDs, logger);

	const goalTime = GetMillisecondsSince(goalTimeStart);

	logger.debug(`Goal Processing took ${goalTime} milliseconds.`);

	void SetJobProgress(job, "Updating Quests.");

	// --- 8. Quests ---
	// Evaluate and update the users quests. This returns...
	const questTimeStart = process.hrtime.bigint();
	const questInfo = await UpdateUsersQuests(goalInfo, game, playtypes, user.id, logger);

	const questTime = GetMillisecondsSince(questTimeStart);

	logger.debug(`Quest Processing took ${questTime} milliseconds.`);

	return {
		classDeltas,
		questInfo,
		goalInfo,
		playtypes,
		scoreIDs,
		errors,
		sessionInfo,
		relativeTimes: {
			importParseTimeRel,
			pbTimeRel,
			sessionTimeRel,
		},
		absoluteTimes: {
			importParseTime,
			sessionTime,
			pbTime,
			ugsTime,
			goalTime,
			questTime,
		},
	};
}

/**
 * Calls UpdateUsersGamePlaytypeStats for every playtype in the import.
 * @returns A flattened array of ClassDeltas
 */
async function UpdateUsersGameStats(
	game: Game,
	modifiedPlaytypes: Array<Playtype>,
	userID: integer,
	classHandler: ClassHandler | null,
	logger: KtLogger
) {
	const promises = [];

	// Instead of using the provided playtypes, run the classHandler on all
	// playtypes. This should only happen if a classHandler is provided, and is
	// a hack fix for things like #480.
	const allPlaytypes = GetGameConfig(game).playtypes;

	const playtypes = classHandler ? allPlaytypes : modifiedPlaytypes;

	for (const pt of playtypes) {
		promises.push(UpdateUsersGamePlaytypeStats(game, pt, userID, classHandler, logger));
	}

	const r = await Promise.all(promises);

	return r.flat(1);
}

/**
 * Parses the return of ImportProcessingInfo into relevant information
 * for the rest the import.
 * @returns The list of scoreIDs used in the import, the list of errors
 * A set of unique chartIDs involved in the import and the scores mapped
 * on their playtype.
 */
function ParseImportInfo(importInfo: Array<ImportProcessingInfo>) {
	const scorePlaytypeMap: ScorePlaytypeMap = {};

	const scoreIDs = [];
	const errors = [];
	const chartIDs: Set<string> = new Set();

	for (const info of importInfo) {
		if (info.success) {
			scoreIDs.push(info.content.score.scoreID);
			chartIDs.add(info.content.score.chartID);

			if (scorePlaytypeMap[info.content.score.playtype]) {
				// @ts-expect-error obviously delusional typescript moment
				scorePlaytypeMap[info.content.score.playtype].push(info.content.score);
			} else {
				scorePlaytypeMap[info.content.score.playtype] = [info.content.score];
			}
		} else {
			errors.push({ type: info.type, message: info.message });
		}
	}

	return { scoreIDs, errors, scorePlaytypeMap, chartIDs };
}

function SetJobProgress(job: ScoreImportJob | undefined, description: string) {
	if (job) {
		return job.updateProgress({ description });
	}
}
