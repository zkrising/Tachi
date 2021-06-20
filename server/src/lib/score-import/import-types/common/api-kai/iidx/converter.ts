import { FindIIDXChartOnInGameIDVersion } from "../../../../../../utils/queries/charts";
import { KaiContext, KaiIIDXScore } from "../types";
import p from "prudence";
import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../../framework/common/converter-failures";
import { FormatPrError } from "../../../../../../utils/prudence";
import { FindSongOnID } from "../../../../../../utils/queries/songs";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "../../../../framework/common/score-utils";
import { Lamps } from "tachi-common";
import { ConverterFunction } from "../../types";
import { DryScore } from "../../../../framework/common/types";

const PR_KaiIIDXScore = {
	music_id: p.isPositiveInteger,
	play_style: p.isIn("SINGLE", "DOUBLE"),
	difficulty: p.isIn("BEGINNER", "NORMAL", "HYPER", "ANOTHER", "LEGGENDARIA"),
	version_played: p.isBoundedInteger(9, 28),
	lamp: p.isBoundedInteger(0, 7),
	ex_score: p.isPositiveInteger,
	miss_count: p.or(p.isPositiveInteger, p.is(-1)),
	fast_count: p.nullable(p.isPositiveInteger),
	slow_count: p.nullable(p.isPositiveInteger),
	timestamp: "string",
};

function ResolveKaiLamp(lamp: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7): Lamps["iidx:SP" | "iidx:DP"] {
	switch (lamp) {
		case 0:
			return "NO PLAY";
		case 1:
			return "FAILED";
		case 3:
			return "EASY CLEAR";
		case 2:
			return "ASSIST CLEAR";
		case 4:
			return "CLEAR";
		case 5:
			return "HARD CLEAR";
		case 6:
			return "EX HARD CLEAR";
		case 7:
			return "FULL COMBO";
	}
}

export const ConvertAPIKaiIIDX: ConverterFunction<unknown, KaiContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const err = p(data, PR_KaiIIDXScore, {}, { allowExcessKeys: true });

	if (err) {
		throw new InvalidScoreFailure(FormatPrError(err));
	}

	// prudence checks this above.
	const score = data as KaiIIDXScore;

	const playtype = score.play_style === "SINGLE" ? "SP" : "DP";

	const chart = await FindIIDXChartOnInGameIDVersion(
		score.music_id,
		playtype,
		score.difficulty,
		// they send integers like 25, 27 - this will convert to our versions.
		score.version_played.toString()
	);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with songID ${score.music_id} (${playtype} ${score.difficulty} - Version ${score.version_played})`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("iidx", chart.songID);

	if (!song) {
		logger.severe(`Song-Chart desync with song ID ${chart.songID} (iidx).`);
		throw new InternalFailure(`Song-Chart desync with song ID ${chart.songID} (iidx).`);
	}

	const lamp = ResolveKaiLamp(score.lamp);

	const { percent, grade } = GenericGetGradeAndPercent("iidx", score.ex_score, chart);

	const timeAchieved = ParseDateFromString(score.timestamp);

	const dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
		comment: null,
		game: "iidx",
		importType,
		timeAchieved,
		service: context.service,
		scoreData: {
			grade,
			percent,
			score: score.ex_score,
			lamp,
			judgements: {},
			hitMeta: {
				fast: score.fast_count,
				slow: score.slow_count,
				bp: score.miss_count === -1 ? null : score.miss_count,
			},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};
