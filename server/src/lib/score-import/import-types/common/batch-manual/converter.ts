import db from "external/mongo/db";
import { KtLogger } from "lib/logger/logger";
import {
	BatchManualScore,
	ChartDocument,
	ImportTypes,
	SongDocument,
	Grades,
	IDStrings,
} from "tachi-common";
import {
	FindBMSChartOnHash,
	FindChartWithPTDF,
	FindChartWithPTDFVersion,
	FindDDRChartOnSongHash,
} from "utils/queries/charts";
import { FindSongOnID, FindSongOnTitleInsensitive } from "utils/queries/songs";
import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent, JubeatGetGrade } from "../../../framework/common/score-utils";
import {
	AssertStrAsDifficulty,
	AssertStrAsPositiveInt,
} from "../../../framework/common/string-asserts";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../types";
import { BatchManualContext } from "./types";
/**
 * Creates a ConverterFn for the BatchManualScore format. This curries
 * the importType into the function, so the right failures can be
 * returned.
 * @returns A BatchManualScore Converter.
 */
export const ConverterBatchManual: ConverterFunction<BatchManualScore, BatchManualContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const game = context.game;

	const { song, chart } = await ResolveMatchTypeToKTData(data, context, importType, logger);

	// yet another temporary hack, jubeat's percent is not a function of score,
	// it's actually an entirely separate metric. We need to support this, so we'll
	// run like this.

	let percent: number;
	let grade: Grades[IDStrings];

	if (game === "jubeat") {
		if (!data.percent && data.percent !== 0) {
			throw new InvalidScoreFailure(
				`The percent field must be filled out for jubeat scores.`
			);
		}

		if (
			data.percent > 100 &&
			(chart as ChartDocument<"jubeat:Single">).data.isHardMode === false
		) {
			throw new InvalidScoreFailure(`The percent field must be <= 100 for normal mode.`);
		}

		// Since GenericGetGradeAndPercent also handles validating percent, we need
		// to handle validating percent here.
		if (data.score > 1_000_000) {
			throw new InvalidScoreFailure(
				`The score field must be a positive integer between 0 and 1 million.`
			);
		}

		percent = data.percent;

		grade = JubeatGetGrade(data.score);
	} else {
		({ percent, grade } = GenericGetGradeAndPercent(context.game, data.score, chart));

		// Temporary hack -- Pop'n upper bounds grades like this. We need to tuck this
		// away further inside genericgetgradeandpercent or something.
		if (game === "popn" && data.lamp === "FAILED" && percent >= 90) {
			grade = "A";
		}
	}

	let service = context.service;

	if (importType === "ir/direct-manual") {
		service += " (DIRECT-MANUAL)";
	} else if (importType === "file/batch-manual") {
		service += " (BATCH-MANUAL)";
	}

	const dryScore: DryScore = {
		game: game,
		service,
		comment: data.comment ?? null,
		importType,
		timeAchieved: data.timeAchieved || null,
		scoreData: {
			lamp: data.lamp,
			score: data.score,
			grade,
			percent,
			judgements: data.judgements ?? {},
			hitMeta: data.hitMeta ?? {},
		},
		scoreMeta: data.scoreMeta ?? {},
	};

	return {
		chart,
		song,
		dryScore,
	};
};

export async function ResolveMatchTypeToKTData(
	data: BatchManualScore,
	context: BatchManualContext,
	importType: ImportTypes,
	logger: KtLogger
): Promise<{ song: SongDocument; chart: ChartDocument }> {
	const game = context.game;

	if (data.matchType === "bmsChartHash") {
		if (game !== "bms") {
			throw new InvalidScoreFailure(`Cannot use bmsChartHash lookup on ${game}.`);
		}

		const chart = await FindBMSChartOnHash(data.identifier);

		if (!chart) {
			throw new KTDataNotFoundFailure(
				`Cannot find chart for hash ${data.identifier}.`,
				importType,
				data,
				context
			);
		}

		if (chart.playtype !== context.playtype) {
			throw new InvalidScoreFailure(
				`Chart ${chart.chartID}'s playtype was ${chart.playtype}, but this was not equal to the import playtype of ${context.playtype}.`
			);
		}

		const song = await FindSongOnID(game, chart.songID);

		if (!song) {
			logger.severe(`BMS songID ${chart.songID} has charts but no parent song.`);
			throw new InternalFailure(`BMS songID ${chart.songID} has charts but no parent song.`);
		}

		return { chart, song };
	} else if (data.matchType === "ddrSongHash") {
		if (game !== "ddr") {
			throw new InvalidScoreFailure(`Cannot use ddrSongHash lookup on ${game}.`);
		}

		if (!data.difficulty) {
			throw new InvalidScoreFailure(
				`Missing 'difficulty' field, but is needed for ddrSongHash lookup.`
			);
		}

		const difficulty = AssertStrAsDifficulty(data.difficulty, game, context.playtype);

		const chart = await FindDDRChartOnSongHash(data.identifier, context.playtype, difficulty);

		if (!chart) {
			throw new KTDataNotFoundFailure(
				`Cannot find chart for songHash ${data.identifier} (${context.playtype} ${difficulty}).`,
				importType,
				data,
				context
			);
		}

		const song = await FindSongOnID(game, chart.songID);

		if (!song) {
			logger.severe(`DDR songID ${chart.songID} has charts but no parent song.`);
			throw new InternalFailure(`DDR songID ${chart.songID} has charts but no parent song.`);
		}

		return { song, chart };
	} else if (data.matchType === "popnChartHash") {
		if (game !== "popn") {
			throw new InvalidScoreFailure(`Cannot use popnChartHash lookup on ${game}.`);
		}

		const chart = await db.charts.popn.findOne({
			playtype: context.playtype,
			"data.hashSHA256": data.identifier,
		});

		if (!chart) {
			throw new KTDataNotFoundFailure(
				`Cannot find chart for popnChartHash ${data.identifier} (${context.playtype}).`,
				importType,
				data,
				context
			);
		}

		const song = await FindSongOnID(game, chart.songID);

		if (!song) {
			logger.severe(`Pop'n songID ${chart.songID} has charts but no parent song.`);
			throw new InternalFailure(
				`Pop'n songID ${chart.songID} has charts but no parent song.`
			);
		}

		return { song, chart };
	} else if (data.matchType === "tachiSongID") {
		const songID = AssertStrAsPositiveInt(
			data.identifier,
			"Invalid songID - must be a stringified positive integer."
		);

		const song = await FindSongOnID(game, songID);

		if (!song) {
			throw new KTDataNotFoundFailure(
				`Cannot find song with songID ${data.identifier}.`,
				importType,
				data,
				context
			);
		}

		const chart = await ResolveChartFromSong(song, data, context, importType);

		return { song, chart };
	} else if (data.matchType === "songTitle") {
		const song = await FindSongOnTitleInsensitive(game, data.identifier);

		if (!song) {
			throw new KTDataNotFoundFailure(
				`Cannot find song with title ${data.identifier}.`,
				importType,
				data,
				context
			);
		}

		const chart = await ResolveChartFromSong(song, data, context, importType);

		return { song, chart };
	} else if (data.matchType === "inGameID") {
		const gamesWithInGameIDSupport = [
			"iidx",
			"ddr",
			"sdvx",
			"jubeat",
			"chunithm",
			"gitadora",
			"maimai",
			"museca",
		];

		if (!gamesWithInGameIDSupport.includes(game)) {
			throw new InvalidScoreFailure(
				`Cannot use inGameID on game ${game}. The game may not have a concept of an in game ID, or support just might not exist yet.`
			);
		}

		let identifier: number | string = data.identifier;
		// ddr uses weird strings as IDs instead of numbers
		if (game !== "ddr") {
			identifier = Number(data.identifier);
		}

		const difficulty = AssertStrAsDifficulty(data.difficulty, game, context.playtype);

		const chart = await db.charts[game].findOne({
			"data.inGameID": identifier,
			playtype: context.playtype,
			difficulty,
		});

		if (!chart) {
			throw new KTDataNotFoundFailure(
				`Cannot find chart for inGameID ${data.identifier} (${context.playtype}).`,
				importType,
				data,
				context
			);
		}

		const song = await db.songs[game].findOne({ id: chart.songID });

		if (!song) {
			logger.severe(`Song-Chart desync on ${chart.songID}.`);
			throw new InternalFailure(`Failed to get song for a chart that exists.`);
		}

		return { song, chart };
	} else if (data.matchType === "uscChartHash") {
		if (game !== "usc") {
			throw new InvalidScoreFailure(`uscChartMash matchType can only be used on USC.`);
		}

		const chart = await db.charts.usc.findOne({
			"data.hashSHA1": data.identifier,
			playtype: context.playtype,
		});

		if (!chart) {
			throw new KTDataNotFoundFailure(
				`Cannot find chart with hash ${data.identifier}.`,
				importType,
				data,
				context
			);
		}

		const song = await db.songs[game].findOne({ id: chart.songID });

		if (!song) {
			logger.severe(`Song-Chart desync on ${chart.songID}.`);
			throw new InternalFailure(`Failed to get song for a chart that exists.`);
		}

		return { song, chart };
	}

	logger.error(
		`Invalid matchType ${data.matchType} ended up in conversion - should have been rejected by prudence?`
	);
	// really, this could be a larger error. - it's an internal failure because prudence should reject this.
	throw new InvalidScoreFailure(`Invalid matchType ${data.matchType}.`);
}

export async function ResolveChartFromSong(
	song: SongDocument,
	data: BatchManualScore,
	context: BatchManualContext,
	importType: ImportTypes
) {
	const game = context.game;

	if (!data.difficulty) {
		throw new InvalidScoreFailure(
			`Missing 'difficulty' field, but was necessary for this lookup.`
		);
	}

	const difficulty = AssertStrAsDifficulty(data.difficulty, game, context.playtype);

	let chart;

	if (context.version) {
		chart = await FindChartWithPTDFVersion(
			game,
			song.id,
			context.playtype,
			difficulty,
			context.version
		);
	} else {
		chart = await FindChartWithPTDF(game, song.id, context.playtype, difficulty);
	}

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Cannot find chart for ${song.title} (${context.playtype} ${difficulty})`,
			importType,
			data,
			context
		);
	}

	return chart;
}
