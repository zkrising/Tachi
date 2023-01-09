import { BMS_PMS_MERGERS } from "./games/bms";
import { IIDX_MERGERS } from "./games/iidx";
import { CreatePBMergeFor } from "./utils";
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

	"chunithm:Single": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	"sdvx:Single": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
		CreatePBMergeFor("optional.exScore", "Best EX Score", (base, score) => {
			base.scoreData.optional.exScore = score.scoreData.optional.exScore;
		}),
	],

	// musicRate is the default prop
	// but we want the user's best score to count aswell.
	"jubeat:Single": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
		CreatePBMergeFor("score", "Best Score", (base, score) => {
			base.scoreData.score = score.scoreData.score;
		}),
	],

	"maimaidx:Single": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],

	"museca:Single": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],

	"popn:9B": [
		CreatePBMergeFor("enumIndexes.clearMedal", "Best Clear", (base, score) => {
			base.scoreData.clearMedal = score.scoreData.clearMedal;
			// these are directly related. pluck both.
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],

	"wacca:Single": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],

	"gitadora:Dora": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	"gitadora:Gita": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],

	"itg:Stamina": [
		// we'll pluck the best lamp, but this game has a pretty interesting concept
		// for merging PBs. This is probably fine.
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],

	"usc:Controller": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	"usc:Keyboard": [
		CreatePBMergeFor("enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
};

/**
 * What should the name be for the first reference on a PB?
 *
 * A PB is initialised from the user's best score on the defaultMetric, so in essence
 * this is a name for that default metric.
 */
export const GPT_PB_DEFAULT_REF_NAMES: Record<GPTString, string> = {
	"bms:14K": "Best Score",
	"bms:7K": "Best Score",
	"chunithm:Single": "Best Score",
	"gitadora:Dora": "Best Percent",
	"gitadora:Gita": "Best Percent",
	"iidx:DP": "Best Score",
	"iidx:SP": "Best Score",
	"jubeat:Single": "Best Music Rate",
	"maimaidx:Single": "Best Percent",
	"museca:Single": "Best Score",
	"pms:Controller": "Best Score",
	"pms:Keyboard": "Best Score",
	"popn:9B": "Best Score",
	"sdvx:Single": "Best Score",
	"usc:Controller": "Best Score",
	"usc:Keyboard": "Best Score",
	"wacca:Single": "Best Score",

	// this name sucks, what should we do instead? TODO.
	"itg:Stamina": "Best Result",
};
