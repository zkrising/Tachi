import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import UpdateScore from "lib/score-mutation/update-score";
import { RecalcGameProfiles } from "scripts/state-sync/recalc-game-profiles";
import { GetGPTString } from "tachi-common";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";
import { RecalcSessions } from "utils/calculations/recalc-sessions";
import { EfficientDBIterate } from "utils/efficient-db-iterate";
import type { DryScoreData } from "lib/score-import/framework/common/types";
import type { GPTString, GPTStrings, integer } from "tachi-common";
import type { Migration } from "utils/types";

interface OldScoreData {
	score: number;
	percent: number;
	lamp: string;
	grade: string;
	lampIndex: integer;
	gradeIndex: integer;
	hitMeta: any;
	judgements: any;
}

type ScoreMover<GPT extends GPTString> = (old: OldScoreData) => DryScoreData<GPT>;
type ScoreMovers = {
	[GPT in GPTString]: ScoreMover<GPT>;
};

const IIDX_MV: ScoreMover<GPTStrings["iidx"]> = (old) => ({
	score: old.score,
	lamp: old.lamp as any,
	judgements: old.judgements,
	optional: {
		bp: old.hitMeta.bp,
		comboBreak: old.hitMeta.comboBreak,
		fast: old.hitMeta.fast,
		slow: old.hitMeta.slow,
		maxCombo: old.hitMeta.maxCombo,
		gauge: old.hitMeta.gauge,
		gaugeHistory: old.hitMeta.gaugeHistory,
		gsmEasy: old.hitMeta.gsm.EASY,
		gsmNormal: old.hitMeta.gsm.NORMAL,
		gsmHard: old.hitMeta.gsm.HARD,
		gsmEXHard: old.hitMeta.gsm.EX_HARD,
	},
});

type NeutralGames = GPTStrings["chunithm" | "museca" | "sdvx" | "usc" | "wacca"];

const _NEUTRAL_MV = (old: OldScoreData): DryScoreData<NeutralGames> => ({
	judgements: old.judgements,
	lamp: old.lamp as any,
	optional: old.hitMeta,
	score: old.score,
});

// silly hack for typechecker
const NEUTRAL_MV = _NEUTRAL_MV as any;

const GITADORA_MV: ScoreMover<GPTStrings["gitadora"]> = (old) => ({
	percent: old.percent,
	optional: old.hitMeta,
	judgements: old.judgements,
	lamp: old.lamp as any,
});

const BMS_MV: ScoreMover<GPTStrings["bms" | "pms"]> = (old) => ({
	score: old.score,
	lamp: old.lamp as any,
	judgements: old.judgements,
	optional: old.hitMeta,
});

const scoreMovers: ScoreMovers = {
	"iidx:SP": IIDX_MV,
	"iidx:DP": IIDX_MV,
	"bms:14K": BMS_MV,
	"bms:7K": BMS_MV,
	"pms:Controller": BMS_MV,
	"pms:Keyboard": BMS_MV,
	"chunithm:Single": NEUTRAL_MV,
	"usc:Controller": NEUTRAL_MV,
	"usc:Keyboard": NEUTRAL_MV,
	"sdvx:Single": NEUTRAL_MV,
	"wacca:Single": NEUTRAL_MV,
	"museca:Single": NEUTRAL_MV,
	"maimaidx:Single": (old) => ({
		percent: old.percent,
		judgements: old.judgements,
		lamp: old.lamp as any,
		optional: old.hitMeta,
	}),
	"jubeat:Single": (old) => ({
		musicRate: old.percent,
		score: old.score,
		judgements: old.judgements,
		lamp: old.lamp as any,
		optional: old.hitMeta,
	}),
	"itg:Stamina": () => {
		throw new Error(
			`Delete ITG scores instead of migrating them, ITG support has fundamentally changed.`
		);
	},
	"popn:9B": (old) => {
		if (!old.hitMeta.specificClearType) {
			throw new Error(
				`This score has an undefined specificClearType, but this property is now necessary. You should have wiped these scores.`
			);
		}

		return {
			clearMedal: old.hitMeta.specificClearType,
			judgements: old.judgements,
			optional: {
				fast: old.hitMeta.fast,
				slow: old.hitMeta.slow,
				gauge: old.hitMeta.gauge,
				maxCombo: old.hitMeta.maxCombo,
			},
			score: old.score,
		};
	},
	"gitadora:Dora": GITADORA_MV,
	"gitadora:Gita": GITADORA_MV,
};

const logger = CreateLogCtx(__filename);

const migration: Migration = {
	id: "v3-scores",
	up: async () => {
		// welp. here we go
		// we need to do a **mass** score migration

		logger.info(`Starting score migration...`);

		await EfficientDBIterate(
			db.scores,
			async (score) => {
				await UpdateScore(score, {
					...score,
					scoreData: scoreMovers[GetGPTString(score.game, score.playtype)](
						score.scoreData as unknown as OldScoreData
					),
				});
			},
			// no-op
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => void 0,
			{
				"scoreData.enumIndexes": { $exists: false },
			}
		);

		logger.info(`Reconstructing PBs...`);
		await UpdateAllPBs();

		logger.info(`Re-calcing Game Profiles...`);
		await RecalcGameProfiles();

		logger.info(`Re-calcing Sessions...`);
		await RecalcSessions();
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

export default migration;
