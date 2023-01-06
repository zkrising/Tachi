import {
	InvalidScoreFailure,
	SongOrChartNotFoundFailure,
	SkipScoreFailure,
} from "../../../framework/common/converter-failures";
import { ParseDateFromString } from "../../../framework/common/score-utils";
import { FindChartWithPTDFVersion } from "utils/queries/charts";
import { FindSongOnTitleInsensitive } from "utils/queries/songs";
import type { DryScore } from "../../../framework/common/types";
import type { ConverterFunction } from "../../common/types";
import type { S3Score } from "./types";
import type { Difficulties, Playtypes, Versions } from "tachi-common";
import type { EmptyObject } from "utils/types";

export function ParseDifficulty(diff: S3Score["diff"]): {
	playtype: Playtypes["iidx"];
	difficulty: Difficulties["iidx:DP" | "iidx:SP"];
} {
	switch (diff) {
		case "L7":
			return { playtype: "SP", difficulty: "NORMAL" };
		case 7:
			return { playtype: "SP", difficulty: "HYPER" };
		case "A":
			return { playtype: "SP", difficulty: "ANOTHER" };
		case "B":
			return { playtype: "SP", difficulty: "LEGGENDARIA" };
		case 5:
			throw new SkipScoreFailure(`5KEY scores are not supported.`);
		case "L14":
			return { playtype: "DP", difficulty: "NORMAL" };
		case 14:
			return { playtype: "DP", difficulty: "HYPER" };
		case "A14":
			return { playtype: "DP", difficulty: "ANOTHER" };
		case "B14":
			return { playtype: "DP", difficulty: "LEGGENDARIA" };
		default:
			throw new InvalidScoreFailure(`Invalid difficulty ${diff}.`);
	}
}

export function ResolveS3Lamp(data: S3Score): GetEnumValue<"iidx:DP" | "iidx:SP", "lamp"> {
	switch (data.cleartype) {
		case "played":
			return "FAILED";
		case "cleared":
			switch (data.mods.hardeasy) {
				case "E":
					return "EASY CLEAR";
				case "H":
					return "HARD CLEAR";
				case undefined:
					return "CLEAR";
				default:
					throw new InvalidScoreFailure(
						`Invalid hardeasy of ${data.mods.hardeasy} while evaluating a 'cleared' score?`
					);
			}

		case "combo":
		case "comboed":
		case "perfect":
		case "perfected":
			return "FULL COMBO";
		default:
			throw new InvalidScoreFailure(`Invalid cleartype of ${data.cleartype}.`);
	}
}

const S3_VERSION_CONV: Record<string, Versions["iidx:SP"]> = {
	"3rd": "3rd Style CS",
	"4th": "4th Style CS",
	"5th": "5th Style CS",
	"6th": "6th Style CS",
	"7th": "7th Style CS",
	"8th": "8th Style CS",
	"9th": "9th Style CS",
	"10th": "10th Style CS",
	red: "IIDX RED CS",
	hs: "HAPPY SKY CS",
	dd: "DISTORTED CS",
	gold: "GOLD CS",
	djt: "DJ TROOPERS CS",
	emp: "EMPRESS CS",
	pb: "EMPRESS CS",
	us: "BEATMANIA US",
};

function ConvertVersion(joinedStyles: string) {
	const styles = joinedStyles.split(",");

	const style = styles[styles.length - 1];

	if (!style) {
		throw new InvalidScoreFailure(`Song has invalid style -- Score has no styles?`);
	}

	const maybeConvertedStyle = S3_VERSION_CONV[style];

	if (!maybeConvertedStyle) {
		throw new InvalidScoreFailure(`Song has invalid style ${style}.`);
	}

	return maybeConvertedStyle;
}

export const ConvertFileS3: ConverterFunction<S3Score, EmptyObject> = async (
	data,
	context,
	importType,
	_logger
) => {
	const song = await FindSongOnTitleInsensitive("iidx", data.songname);

	if (!song) {
		throw new SongOrChartNotFoundFailure(
			`Could not find song with title ${data.songname}`,
			importType,
			data,
			context
		);
	}

	const { playtype, difficulty } = ParseDifficulty(data.diff);
	const version = ConvertVersion(data.styles);

	const chart = await FindChartWithPTDFVersion("iidx", song.id, playtype, difficulty, version);

	if (!chart) {
		throw new SongOrChartNotFoundFailure(
			`Could not find chart ${data.songname} (${playtype} ${difficulty} version (${version}))`,
			importType,
			data,
			context
		);
	}

	const lamp = ResolveS3Lamp(data);

	const timeAchieved = ParseDateFromString(data.date);

	let judgements = {};

	if (data.scorebreakdown) {
		judgements = {
			pgreat: data.scorebreakdown.justgreats,
			great: data.scorebreakdown.greats,
			good: data.scorebreakdown.good,
			bad: data.scorebreakdown.bad,
			poor: data.scorebreakdown.poor,
		};
	}

	const dryScore: DryScore<"iidx:DP" | "iidx:SP"> = {
		game: "iidx",
		comment: data.comment ?? null,
		importType: "file/solid-state-squad",
		service: "Solid State Squad",
		scoreData: {
			score: data.exscore,
			lamp,
			judgements,
			optional: {},
		},
		scoreMeta: {},
		timeAchieved,
	};

	return { chart, song, dryScore };
};
