import { IIDXLIKE_DERIVERS, IIDXLIKE_VALIDATORS, SDVXLIKE_DERIVERS } from "./games/_common";
import { CHUNITHM_IMPL } from "./games/chunithm";
import { GITADORA_DORA_IMPL, GITADORA_GITA_IMPL } from "./games/gitadora";
import { ITG_STAMINA_IMPL } from "./games/itg";
import { JUBEAT_IMPL } from "./games/jubeat";
import { MAIMAIDX_IMPL } from "./games/maimaidx";
import { MUSECA_IMPL } from "./games/museca";
import { POPN_9B_IMPL } from "./games/popn";
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
	"bms:14K": {
		derivers: IIDXLIKE_DERIVERS,
		validators: IIDXLIKE_VALIDATORS,
	},
	"bms:7K": {
		derivers: IIDXLIKE_DERIVERS,
		validators: IIDXLIKE_VALIDATORS,
	},
	"pms:Controller": {
		derivers: IIDXLIKE_DERIVERS,
		validators: IIDXLIKE_VALIDATORS,
	},
	"pms:Keyboard": {
		derivers: IIDXLIKE_DERIVERS,
		validators: IIDXLIKE_VALIDATORS,
	},
	"iidx:SP": {
		derivers: IIDXLIKE_DERIVERS,
		validators: IIDXLIKE_VALIDATORS,
	},
	"iidx:DP": {
		derivers: IIDXLIKE_DERIVERS,
		validators: IIDXLIKE_VALIDATORS,
	},

	"wacca:Single": WACCA_IMPL,
	"chunithm:Single": CHUNITHM_IMPL,
	"gitadora:Dora": GITADORA_DORA_IMPL,
	"gitadora:Gita": GITADORA_GITA_IMPL,
	"itg:Stamina": ITG_STAMINA_IMPL,
	"jubeat:Single": JUBEAT_IMPL,
	"maimaidx:Single": MAIMAIDX_IMPL,
	"museca:Single": MUSECA_IMPL,
	"popn:9B": POPN_9B_IMPL,
	"sdvx:Single": {
		derivers: SDVXLIKE_DERIVERS,
		validators: {
			exScore: (exScore, chart) => {
				// gotta figure this out somehow?
				throw new Error(`Unimplemented.`);
			},
		},
	},

	"usc:Controller": { derivers: SDVXLIKE_DERIVERS, validators: {} },
	"usc:Keyboard": { derivers: SDVXLIKE_DERIVERS, validators: {} },
};
