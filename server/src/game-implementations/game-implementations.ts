import { BMS_14K_IMPL, BMS_7K_IMPL, PMS_CONTROLLER_IMPL, PMS_KEYBOARD_IMPL } from "./games/bms-pms";
import { CHUNITHM_IMPL } from "./games/chunithm";
import { GITADORA_DORA_IMPL, GITADORA_GITA_IMPL } from "./games/gitadora";
import { IIDX_DP_IMPL, IIDX_SP_IMPL } from "./games/iidx";
import { ITG_STAMINA_IMPL } from "./games/itg";
import { JUBEAT_IMPL } from "./games/jubeat";
import { MAIMAIDX_IMPL } from "./games/maimaidx";
import { MUSECA_IMPL } from "./games/museca";
import { POPN_9B_IMPL } from "./games/popn";
import { SDVX_IMPL } from "./games/sdvx";
import { USC_CONTROLLER_IMPL, USC_KEYBOARD_IMPL } from "./games/usc";
import { WACCA_IMPL } from "./games/wacca";
import type { GPTImplementations } from "./types";

/**
 * Server-Specific implementation details for games. These handle things like validating
 * input for chart-specific metrics (i.e EXScore in IIDX is upper-bounded by
 * a chart's notecount * 2) and also instructions on how to derive metrics from
 * the provided metrics.
 *
 * Basically, anything that can't be done in the common config, specific to the server.
 */
export const GPT_SERVER_IMPLEMENTATIONS: GPTImplementations = {
	"bms:14K": BMS_14K_IMPL,
	"bms:7K": BMS_7K_IMPL,
	"pms:Controller": PMS_CONTROLLER_IMPL,
	"pms:Keyboard": PMS_KEYBOARD_IMPL,
	"iidx:SP": IIDX_SP_IMPL,
	"iidx:DP": IIDX_DP_IMPL,
	"wacca:Single": WACCA_IMPL,
	"chunithm:Single": CHUNITHM_IMPL,
	"gitadora:Dora": GITADORA_DORA_IMPL,
	"gitadora:Gita": GITADORA_GITA_IMPL,
	"itg:Stamina": ITG_STAMINA_IMPL,
	"jubeat:Single": JUBEAT_IMPL,
	"maimaidx:Single": MAIMAIDX_IMPL,
	"museca:Single": MUSECA_IMPL,
	"popn:9B": POPN_9B_IMPL,
	"usc:Controller": USC_CONTROLLER_IMPL,
	"usc:Keyboard": USC_KEYBOARD_IMPL,
	"sdvx:Single": SDVX_IMPL,
};
