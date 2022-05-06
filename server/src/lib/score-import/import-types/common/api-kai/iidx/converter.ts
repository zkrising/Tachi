import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../../framework/common/converter-failures";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "../../../../framework/common/score-utils";
import p from "prudence";
import { FormatPrError } from "utils/prudence";
import { FindIIDXChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { DryScore } from "../../../../framework/common/types";
import type { ConverterFunction } from "../../types";
import type { KaiContext, KaiIIDXScore } from "../types";
import type { integer, Lamps } from "tachi-common";

const PR_KaiIIDXScore = {
	music_id: p.isPositiveInteger,
	play_style: p.isIn("SINGLE", "DOUBLE"),
	difficulty: p.isIn("BEGINNER", "NORMAL", "HYPER", "ANOTHER", "LEGGENDARIA"),
	version_played: p.isBoundedInteger(9, 28),
	lamp: p.isBoundedInteger(0, 7),
	ex_score: p.isPositiveInteger,
	miss_count: p.or(p.isPositiveInteger, p.is(-1), "null"),
	fast_count: p.nullable(p.isPositiveInteger),
	slow_count: p.nullable(p.isPositiveInteger),
	timestamp: "string",
};

function ResolveKaiLamp(lamp: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7): Lamps["iidx:DP" | "iidx:SP"] {
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

// LEGGENDARIAs got turned into a real difficulty as of HEROIC VERSE.
// This service still sends the old songIDs when old scores are requested,
// so we need to convert it up.
const OldLeggendariaConversionTable: Record<integer, integer> = {
	// RUGGED ASH† -> RUGGED ASH
	1100: 1017,

	// Clione† -> Clione
	4100: 4005,

	// ABSOLUTE† -> ABSOLUTE
	4101: 4001,

	// RIDE ON THE LIGHT (HI GREAT MIX) † -> RIDE ON THE LIGHT (HI GREAT MIX)
	5100: 5014,

	// RED ZONE† -> RED ZONE
	11100: 11032,

	// spiral galaxy† -> spiral galaxy
	11101: 11012,

	// Little Little Princess† -> Little Little Princess
	12100: 12002,

	// CONTRACT† -> CONTRACT
	13100: 13010,

	// VANESSA† -> VANESSA
	14100: 14009,

	// KAMAITACHI† -> KAMAITACHI
	14101: 14046,

	// ICARUS† -> ICARUS
	15101: 15023,

	// THE DEEP STRIKER† -> THE DEEP STRIKER
	15102: 15007,

	// Blue Rain† -> Blue Rain
	15104: 15004,

	// Wanna Party?† -> Wanna Party?
	15105: 15045,

	// 凛として咲く花の如く† -> 凛として咲く花の如く
	16101: 16050,

	// THANK YOU FOR PLAYING† -> THANK YOU FOR PLAYING
	16102: 16045,

	// naughty girl@Queen's Palace† -> naughty girl@Queen's Palace
	16103: 16031,

	// Kung-fu Empire† -> Kung-fu Empire
	16104: 16015,

	// SOLID STATE SQUAD† -> SOLID STATE SQUAD
	17101: 17060,

	// Golden Palms† -> Golden Palms
	18100: 18025,

	// おおきなこえで† -> おおきなこえで
	18103: 18011,

	// QUANTUM TELEPORTATION† -> QUANTUM TELEPORTATION
	19100: 19063,

	// 朧† -> 朧
	20103: 20100,

	// 仮想空間の旅人たち† -> 仮想空間の旅人たち
	20104: 20039,

	// LUV CAN SAVE U† -> LUV CAN SAVE U
	20105: 20068,

	// Howling† -> Howling
	20106: 20024,

	// 龍と少女とデコヒーレンス† -> 龍と少女とデコヒーレンス
	20107: 20019,

	// Close the World feat.a☆ru†LEGGENDARIA -> Close the World feat. a☆ru
	21100: 21012,

	// Sigmund†LEGGENDARIA -> Sigmund
	21101: 21059,

	// Ancient Scapes†LEGGENDARIA -> Ancient Scapes
	21102: 21069,

	// invoker†LEGGENDARIA -> invoker
	21103: 21073,

	// Feel The Beat†LEGGENDARIA -> Feel The Beat
	21104: 21052,

	// 疾風迅雷†LEGGENDARIA -> 疾風迅雷
	21105: 21048,

	// Verflucht†LEGGENDARIA -> Verflucht
	21106: 21050,

	// 廿† -> 廿
	21107: 21029,

	// CHRONO DIVER -NORNIR-† -> CHRONO DIVER -NORNIR-
	22101: 22008,

	// chrono diver -fragment-† -> chrono diver -fragment-
	22102: 22013,

	// 恋は白帯、サンシロー† -> 恋は白帯、サンシロー
	22103: 22024,

	// Beat Radiance† -> Beat Radiance
	22104: 22027,

	// 超青少年ノ為ノ超多幸ナ超古典的超舞曲† -> 超青少年ノ為ノ超多幸ナ超古典的超舞曲
	22105: 22031,

	// EBONY & IVORY† -> EBONY & IVORY
	22106: 22089,

	// Cosmic Cat† -> Cosmic Cat
	22107: 22006,

	// Damage Per Second† -> Damage Per Second
	23100: 23054,

	// STARLIGHT DANCEHALL† -> STARLIGHT DANCEHALL
	23101: 23031,

	// Amazing Mirage† -> Amazing Mirage
	24100: 24041,

	// 冬椿 ft. Kanae Asaba† -> 冬椿 ft. Kanae Asaba
	24101: 24011,
};

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

	const version = score.version_played.toString();

	if (!["20", "21", "22", "23", "24", "25", "26", "27", "28"].includes(version)) {
		throw new InvalidScoreFailure(`Unsupported version ${score.version_played}.`);
	}

	let musicID = score.music_id;

	if (OldLeggendariaConversionTable[score.music_id]) {
		musicID = OldLeggendariaConversionTable[score.music_id]!;

		// This is now definitely a leggendaria.
		score.difficulty = "LEGGENDARIA";
	}

	const chart = await FindIIDXChartOnInGameIDVersion(
		musicID,
		playtype,
		score.difficulty,

		// they send integers like 25, 27 - this will convert to our versions.
		version as "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28"
	);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with songID ${musicID} (${playtype} ${score.difficulty} - Version ${score.version_played})`,
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

	const dryScore: DryScore<"iidx:DP" | "iidx:SP"> = {
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
				bp: score.miss_count === -1 || score.miss_count === null ? null : score.miss_count,
			},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};
