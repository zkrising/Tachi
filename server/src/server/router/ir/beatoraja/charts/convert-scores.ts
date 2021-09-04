import { PBScoreDocument, integer, ScoreDocument, ChartDocument } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetUsernameFromUserID } from "utils/user";

const LAMP_TO_BEATORAJA = [0, 1, 3, 4, 5, 6, 7, 8] as const;

const RAN_INDEXES = {
	NONRAN: 0,
	MIRROR: 1,
	RANDOM: 2,
	"R-RANDOM": 3,
	"S-RANDOM": 4,
} as const;

type BeatorajaJudgements = `${"e" | "l"}${"pg" | "gr" | "gd" | "bd" | "pr"}`;

type BeatorajaScoreJudgements = {
	[K in BeatorajaJudgements]: integer;
};

type BeatorajaPartialScoreFormat = {
	sha256: string;
	player: string;
	playcount: integer;
	clear: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
	date: number;
	deviceType: string | null;
	gauge: number;
	random: 0 | 1 | 2 | 3 | 4 | null;
	passnotes: integer;
	minbp: integer;
	notes: integer;
	maxcombo: integer | null;
};

export type BeatorajaIRScoreFormat = BeatorajaPartialScoreFormat & BeatorajaScoreJudgements;

/**
 * Converts various data from Tachi to the beatoraja format.
 * @param pbScore - The users PB Score document for this chart.
 * @param sha256 - The SHA256 for this chart.
 * @param username - The users name. Beatoraja uses the special value "" to indicate the user is the current player.
 * @param notecount - The notecount for this chart.
 * @param playcount - The total times this player has played this chart.
 * @param inputDevice - The input device this user used.
 * @param random - What random modifier was used.
 * @returns A Beatoraja Score Document.
 */
export function TachiScoreDataToBeatorajaFormat(
	pbScore: PBScoreDocument<"bms:7K" | "bms:14K">,
	sha256: string,
	username: string,
	notecount: integer,
	playcount: integer
) {
	const scoreData = pbScore.scoreData;

	const beatorajaScore: BeatorajaPartialScoreFormat = {
		sha256,
		player: username,
		playcount,
		clear: LAMP_TO_BEATORAJA[scoreData.lampIndex] ?? 0,
		date: pbScore.timeAchieved ?? 0,
		maxcombo: scoreData.hitMeta.maxCombo ?? 0,
		gauge: scoreData.hitMeta.gauge ?? 0,
		deviceType: null, // These two are now unsupported due to performance concerns.
		random: null,
		minbp: scoreData.hitMeta.bp ?? 0,
		passnotes: 0,
		notes: notecount,
	};

	const judgements: Partial<BeatorajaScoreJudgements> = {};

	// Not everything exports these properties. If they're not there, they should default to 0.
	// For cases like LR2/manual - this will just result in a set of 0s.
	for (const key of [
		"epg",
		"lpg",
		"egr",
		"lgr",
		"egd",
		"lgd",
		"ebd",
		"lbd",
		"epr",
		"lpr",
		"ems",
		"lms",
	] as BeatorajaJudgements[]) {
		judgements[key] = scoreData.hitMeta[key] ?? 0;
	}

	return beatorajaScore;
}
