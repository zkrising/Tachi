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
import db from "external/mongo/db";
import { GetGamePTConfig } from "tachi-common";
import {
	FindBMSChartOnHash,
	FindChartWithPTDF,
	FindChartWithPTDFVersion,
	FindDDRChartOnSongHash,
	FindITGChartOnHash,
	FindSDVXChartOnInGameID,
	FindSDVXChartOnInGameIDVersion,
} from "utils/queries/charts";
import { FindSongOnID, FindSongOnTitleInsensitive } from "utils/queries/songs";
import type { DryScore } from "../../../framework/common/types";
import type { ConverterFunction } from "../types";
import type { BatchManualContext } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type {
	BatchManualScore,
	ChartDocument,
	Grades,
	IDStrings,
	ImportTypes,
	SongDocument,
	Difficulties,
	GPTSupportedVersions,
} from "tachi-common";

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
		if (data.percent === undefined) {
			throw new InvalidScoreFailure(
				`The percent field must be filled out for jubeat scores.`
			);
		}

		const accidentallyDividedTooMuchPercent = (chart as ChartDocument<"jubeat:Single">).data
			.isHardMode
			? 1.2
			: 1;

		if (data.percent <= accidentallyDividedTooMuchPercent && data.score >= 100_000) {
			throw new InvalidScoreFailure(
				`The percent you passed for this jubeat score was less than 1, but the score was above 100k. This is not possible. Have you sent percent as a number between 0 and 1?`
			);
		}

		if (data.percent > 100 && !(chart as ChartDocument<"jubeat:Single">).data.isHardMode) {
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
		service = `${service} (DIRECT-MANUAL)`;
	} else if (importType === "file/batch-manual") {
		service = `${service} (BATCH-MANUAL)`;
	}

	const dryScore: DryScore = {
		game,
		service,
		comment: data.comment ?? null,
		importType,

		// For backwards compatibility reasons, an explicitly passed timeAchieved of 0 should be interpreted as null.
		timeAchieved: data.timeAchieved === 0 ? null : data.timeAchieved ?? null,
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

	switch (data.matchType) {
		case "bmsChartHash": {
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
				throw new InternalFailure(
					`BMS songID ${chart.songID} has charts but no parent song.`
				);
			}

			return { chart, song };
		}

		case "itgChartHash": {
			if (game !== "itg") {
				throw new InvalidScoreFailure(`Cannot use itgChartHash lookup on ${game}.`);
			}

			const chart = await FindITGChartOnHash(data.identifier);

			if (!chart) {
				throw new KTDataNotFoundFailure(
					`Cannot find chart for itgChartHash ${data.identifier}.`,
					importType,
					data,
					context
				);
			}

			const song = await FindSongOnID(game, chart.songID);

			if (!song) {
				logger.severe(`ITG songID ${chart.songID} has charts but no parent song.`);
				throw new InternalFailure(
					`ITG songID ${chart.songID} has charts but no parent song.`
				);
			}

			return { song, chart };
		}

		case "ddrSongHash": {
			if (game !== "ddr") {
				throw new InvalidScoreFailure(`Cannot use ddrSongHash lookup on ${game}.`);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!data.difficulty) {
				throw new InvalidScoreFailure(
					`Missing 'difficulty' field, but is needed for ddrSongHash lookup.`
				);
			}

			const difficulty = AssertStrAsDifficulty(data.difficulty, game, context.playtype);

			const chart = await FindDDRChartOnSongHash(
				data.identifier,
				context.playtype,
				difficulty
			);

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
				throw new InternalFailure(
					`DDR songID ${chart.songID} has charts but no parent song.`
				);
			}

			return { song, chart };
		}

		case "popnChartHash": {
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
		}

		case "tachiSongID": {
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
		}

		case "songTitle": {
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
		}

		case "sdvxInGameID": {
			if (game !== "sdvx") {
				throw new InvalidScoreFailure(
					`A matchType of sdvxInGameID is only supported by SDVX.`
				);
			}

			let chart: ChartDocument | null;

			const identifier = Number(data.identifier);

			const config = GetGamePTConfig("sdvx", "Single");

			if (!config.difficulties.includes(data.difficulty) && data.difficulty !== "ANY_INF") {
				throw new InvalidScoreFailure(
					`Invalid difficulty '${
						data.difficulty
					}', Expected any of ${config.difficulties.join(", ")} or ANY_INF`
				);
			}

			const diff = data.difficulty as Difficulties["sdvx:Single"] | "ANY_INF";

			if (context.version) {
				if (!config.supportedVersions.includes(context.version)) {
					throw new InvalidScoreFailure(
						`Unsupported version ${
							context.version
						}. Expected any of ${config.supportedVersions.join(", ")}.`
					);
				}

				chart = await FindSDVXChartOnInGameIDVersion(
					identifier,
					diff,
					context.version as GPTSupportedVersions["sdvx:Single"]
				);
			} else {
				chart = await FindSDVXChartOnInGameID(identifier, diff);
			}

			if (!chart) {
				throw new KTDataNotFoundFailure(
					`Cannot find SDVX chart with inGameID ${identifier}, difficulty ${diff} and version ${context.version}.`,
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

		case "inGameID": {
			const gamesWithInGameIDSupport = [
				"iidx",
				"popn",
				"ddr",
				"jubeat",
				"chunithm",
				"gitadora",
				"maimai",
				"museca",
			];

			if (game === "sdvx") {
				throw new InvalidScoreFailure(
					`Cannot use inGameID as a matchType for SDVX. Use matchType: 'sdvxInGameID' instead.`
				);
			}

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

			let chart;

			if (context.version) {
				chart = await db.charts[game].findOne({
					"data.inGameID": identifier,
					playtype: context.playtype,
					difficulty,
					versions: context.version,
				});
			} else {
				chart = await db.charts[game].findOne({
					"data.inGameID": identifier,
					playtype: context.playtype,
					difficulty,
				});
			}

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
		}

		case "uscChartHash": {
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

		default: {
			const { matchType } = data;

			logger.error(
				`Invalid matchType ${matchType} ended up in conversion - should have been rejected by prudence?`
			);

			// really, this could be a larger error. - it's an internal failure because prudence should reject this.
			throw new InvalidScoreFailure(`Invalid matchType ${matchType}.`);
		}
	}
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
