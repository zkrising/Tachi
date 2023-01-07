import { BMS_14K_SCORE_CALC, BMS_7K_SCORE_CALC } from "./games/bms";
import { CHUNITHM_SCORE_CALC } from "./games/chunithm";
import { IIDX_DP_SCORE_CALC, IIDX_SP_SCORE_CALC } from "./games/iidx";
import type { GPTScoreCalculators } from "./types";

export const SCORE_CALCULATORS: GPTScoreCalculators = {
	"iidx:SP": IIDX_SP_SCORE_CALC,
	"iidx:DP": IIDX_DP_SCORE_CALC,
	"bms:7K": BMS_7K_SCORE_CALC,
	"bms:14K": BMS_14K_SCORE_CALC,
	"chunithm:Single": CHUNITHM_SCORE_CALC,
	"jubeat:Single": JUBEAT_SCORE_CALC,
	"gitadora:Dora": GITADORA_DORA_SCORE_CALC,
	"gitadora:Gita": GITADORA_GITA_SCORE_CALC,
	"itg:Stamina": ITG_STAMINA_SCORE_CALC,
	"maimaidx:Single": MAIMAI_DX_SCORE_CALC,
	"museca:Single": MUSECA_SCORE_CALC,
	"pms:Controller": PMS_CONTROLLER_SCORE_CALC,
	"pms:Keyboard": PMS_KEYBOARD_SCORE_CALC,
	"popn:9B": POPN_9B_SCORE_CALC,
	"sdvx:Single": SDVX_SCORE_CALC,
	"usc:Controller": USC_CONTROLLER_SCORE_CALC,
	"usc:Keyboard": USC_KEYBOARD_SCORE_CALC,
	"wacca:Single": WACCA_SCORE_CALC,
};
