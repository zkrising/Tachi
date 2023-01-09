import { BMS_PMS_MERGERS } from "./games/bms";
import { IIDX_MERGERS } from "./games/iidx";
import type { PBMergeFunction } from "./types";
import type { GPTString } from "tachi-common";

type GPTPBMergeFNs = {
	[GPT in GPTString]: Array<PBMergeFunction<GPT>>;
};

export const GPT_PB_MERGE_FNS: GPTPBMergeFNs = {
	"iidx:SP": IIDX_MERGERS,
	"iidx:DP": IIDX_MERGERS,

	"bms:14K": BMS_PMS_MERGERS,
	"bms:7K": BMS_PMS_MERGERS,
	"pms:Controller": BMS_PMS_MERGERS,
	"pms:Keyboard": BMS_PMS_MERGERS,

	"chunithm:Single": [],
};
