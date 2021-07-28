import { USCClientScore } from "server/router/ir/usc/types";
import { FindSongOnID } from "utils/queries/songs";
import { KtLogger } from "lib/logger/logger";
import { InternalFailure, InvalidScoreFailure } from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { IRUSCContext } from "./types";
import { Lamps } from "tachi-common";
import { ConverterFunction } from "../../common/types";
import { DryScore } from "../../../framework/common/types";
import {
	USC_DEFAULT_HOLD,
	USC_DEFAULT_MISS,
	USC_DEFAULT_NEAR,
	USC_DEFAULT_PERFECT,
	USC_DEFAULT_SLAM,
} from "lib/constants/usc-ir";

/**
 * Interprets the "note mod" used based on the USC score.
 */
export function DeriveNoteMod(data: USCClientScore): "NORMAL" | "MIRROR" | "RANDOM" | "MIR-RAN" {
	if (data.options.mirror && data.options.random) {
		return "MIR-RAN";
	} else if (data.options.mirror) {
		return "MIRROR";
	} else if (data.options.random) {
		return "RANDOM";
	}

	return "NORMAL";
}

/**
 * Determines the lamp of a USC score.
 */
export function DeriveLamp(scoreDoc: USCClientScore, logger: KtLogger): Lamps["usc:Single"] {
	if (scoreDoc.score === 10_000_000) {
		return "PERFECT ULTIMATE CHAIN";
	} else if (scoreDoc.error === 0) {
		return "ULTIMATE CHAIN";
	} else if (scoreDoc.options.gaugeType === 0) {
		return scoreDoc.gauge >= 70 ? "CLEAR" : "FAILED";
	} else if (scoreDoc.options.gaugeType === 1) {
		return scoreDoc.gauge > 0 ? "EXCESSIVE CLEAR" : "FAILED";
	}

	logger.error(`Could not derive Lamp from Score Document`, { scoreDoc });
	throw new InternalFailure(`Could not derive Lamp from Score Document`);
}

export const ConverterIRUSC: ConverterFunction<USCClientScore, IRUSCContext> = async (
	data,
	context,
	importType,
	logger
) => {
	if (
		data.windows.perfect !== USC_DEFAULT_PERFECT ||
		data.windows.good !== USC_DEFAULT_NEAR ||
		data.windows.hold !== USC_DEFAULT_HOLD ||
		data.windows.miss !== USC_DEFAULT_MISS ||
		data.windows.slam !== USC_DEFAULT_SLAM
	) {
		logger.verbose(`Ignored score because hitWindows were modified.`);
		throw new InvalidScoreFailure(`HitWindows have been modified - Score is invalid.`);
	}

	// if any auto-like option is enabled, reject score.
	if (data.options.autoFlags !== 0) {
		logger.verbose(`Ignored score because autoplay was enabled.`);
		throw new InvalidScoreFailure(`Autoplay was enabled - Score is invalid.`);
	}

	const song = await FindSongOnID("usc", context.chart.songID);

	if (!song) {
		logger.severe(`Song-Chart desync on USCIR ${context.chart.songID}.`);
		throw new InternalFailure(`Song-Chart desync on USCIR ${context.chart.songID}.`);
	}

	const { grade, percent } = GenericGetGradeAndPercent("usc", data.score, context.chart);

	const dryScore: DryScore<"usc:Single"> = {
		comment: null,
		game: "usc",
		importType,
		timeAchieved: Date.now(),
		service: "USC-IR",
		scoreData: {
			grade,
			percent,
			score: data.score,
			lamp: DeriveLamp(data, logger),
			judgements: {
				critical: data.crit,
				near: data.near,
				miss: data.error,
			},
			hitMeta: {
				gauge: data.gauge,
			},
		},
		scoreMeta: {
			gaugeMod: data.options.gaugeOpt === 0 ? "NORMAL" : "HARD",
			noteMod: DeriveNoteMod(data),
		},
	};

	return { chart: context.chart, song, dryScore };
};
