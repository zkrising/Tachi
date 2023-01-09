import db from "external/mongo/db";
import type { PBScoreDocumentNoRank } from "../create-pb-doc";
import type { PBMergeFunction } from "./types";
import type { FilterQuery } from "mongodb";
import type {
	ConfDerivedMetrics,
	ConfOptionalMetrics,
	ConfProvidedMetrics,
	GPTString,
	ScoreDocument,
} from "tachi-common";
import type { ExtractEnumMetricNames } from "tachi-common/types/metrics";

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

export function HandleAsOf(
	query: FilterQuery<ScoreDocument>,
	asOfTimestamp: number | null
): FilterQuery<ScoreDocument> {
	if (asOfTimestamp === null) {
		return query;
	}

	return {
		...query,
		timeAchieved: { $lt: asOfTimestamp },
	};
}

/**
 * Utility for making a PB merge function. In short, get the best score this user has
 * on this chart for the stated metric, then run the applicator if a score was found.
 *
 * @note Don't worry about updating enumIndexes. Those are updated for you,.
 */
export function CreatePBMergeFor<GPT extends GPTString>(
	metric: MetricKeys<GPT>,
	name: string,
	applicator: (base: PBScoreDocumentNoRank<GPT>, score: ScoreDocument<GPT>) => void
): PBMergeFunction<GPT> {
	return async (userID, chartID, asOfTimestamp, base) => {
		const bestScoreFor = (await db.scores.findOne(
			HandleAsOf(
				{
					userID,
					chartID,
					[`scoreData.${metric as string}`]: { $exists: true },
				},
				asOfTimestamp
			),
			{
				sort: {
					[`scoreData.${metric as string}`]: -1,
				},
			}
		)) as ScoreDocument<GPT> | null;

		if (bestScoreFor === null) {
			return null;
		}

		applicator(base, bestScoreFor);

		// also gotta apply this
		// if bestScoreFor is a highlight, base becomes a highlight.
		// this operator is equivalent to = base.highlight || bestScoreFor.highlight
		// and now that i've had to write that out
		// i wonder if it was worth the lack of clarity.
		base.highlight ||= bestScoreFor.highlight;

		// if this timestamp is newer than the most recent one
		if (
			bestScoreFor.timeAchieved !== null &&
			bestScoreFor.timeAchieved > (base.timeAchieved ?? -Infinity)
		) {
			base.timeAchieved = bestScoreFor.timeAchieved;
		}

		return {
			name,
			scoreID: bestScoreFor.scoreID,
		};
	};
}
