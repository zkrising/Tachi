import db from "external/mongo/db";
import type {
	ConfDerivedMetrics,
	ConfOptionalMetrics,
	ConfProvidedMetrics,
	GPTString,
	PBScoreDocument,
	ScoreDocument,
	integer,
} from "tachi-common";
import type { ExtractEnumMetricNames } from "tachi-common/types/metrics";

/**
 * A PBMergeFunction just gets the user for this score and the chart its on.
 * They are expected to mutate the existingPB to add/change whatever
 * properties they feel like should be merged.
 */
export type PBMergeFunction<GPT extends GPTString> = (
	userID: integer,
	chartID: string,
	existingPB: PBScoreDocument<GPT>
) => Promise<void>;

type GPTPBMergeFNs = {
	[GPT in GPTString]: Array<PBMergeFunction<GPT>>;
};

// insane typemagic to get mongodb-safe names for this GPT's metrics.
type MetricKeys<GPT extends GPTString> = Exclude<
	| keyof ConfDerivedMetrics[GPT]
	| keyof ConfProvidedMetrics[GPT]
	// @ts-expect-error For some unfathomable reason, typescript thinks that
	// this keyof Record<string, T> might be a symbol for some reason. Who knows.
	| `enumIndexes.${ExtractEnumMetricNames<ConfDerivedMetrics[GPT] & ConfProvidedMetrics[GPT]>}`
	// @ts-expect-error see above
	| `optional.${keyof ConfOptionalMetrics[GPT]}`
	// @ts-expect-error see above
	| `optional.enumIndexes.${ExtractEnumMetricNames<ConfOptionalMetrics[GPT]>}`,
	// --- exclude these ---
	// Don't allow bare enums, you should use `enumIndexes.ENUMNAME` instead, as those
	// can be sorted on.
	| ExtractEnumMetricNames<ConfDerivedMetrics[GPT] & ConfProvidedMetrics[GPT]>
	// @ts-expect-error see above
	| `optional.${ExtractEnumMetricNames<ConfOptionalMetrics[GPT]>}`
>;

/**
 * Utility for making a PB merge function. In short, get the best score this user has
 * on this chart for the stated metric, then run the applicator if a score was found.
 */
function CreatePBMergeFor<GPT extends GPTString>(
	metric: MetricKeys<GPT>,
	applicator: (base: PBScoreDocument<GPT>, score: ScoreDocument<GPT>) => void
): PBMergeFunction<GPT> {
	return async (userID, chartID, base) => {
		const bestScoreFor = (await db.scores.findOne(
			{
				userID,
				chartID,
				[`scoreData.${metric as string}`]: { $exists: true },
			},
			{
				sort: {
					[`scoreData.${metric as string}`]: -1,
				},
			}
		)) as ScoreDocument<GPT> | null;

		if (bestScoreFor === null) {
			return;
		}

		applicator(base, bestScoreFor);
	};
}

const GPT_PB_MERGE_FNS: GPTPBMergeFNs = {
	"iidx:SP": [
		CreatePBMergeFor("enumIndexes.lamp", (base, lamp) => {
			// lampRating needs to be updated.
			base.calculatedData.ktLampRating = lamp.calculatedData.ktLampRating;

			// Update lamp related iidx-specific info from the lampPB.
			base.scoreData.optional.gsmEasy = lamp.scoreData.optional.gsmEasy;
			base.scoreData.optional.gsmNormal = lamp.scoreData.optional.gsmNormal;
			base.scoreData.optional.gsmHard = lamp.scoreData.optional.gsmHard;
			base.scoreData.optional.gsmEXHard = lamp.scoreData.optional.gsmEXHard;

			base.scoreData.optional.gauge = lamp.scoreData.optional.gauge;
			base.scoreData.optional.gaugeHistory = lamp.scoreData.optional.gaugeHistory;

			base.scoreData.optional.comboBreak = lamp.scoreData.optional.comboBreak;
		}),
	],
};
