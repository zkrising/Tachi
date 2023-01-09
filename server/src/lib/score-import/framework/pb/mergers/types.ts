import type { PBScoreDocumentNoRank } from "../create-pb-doc";
import type { GPTString, PBReference, integer } from "tachi-common";

/**
 * A PBMergeFunction just gets the user for this score and the chart its on.
 * They are expected to mutate the existingPB to add/change whatever
 * properties they feel like should be merged.
 *
 * They should then return some information (a name and a scoreID) to indicate
 * what this PB is composed of.
 */
export type PBMergeFunction<GPT extends GPTString> = (
	userID: integer,
	chartID: string,
	asOfTimestamp: number | null,
	existingPB: PBScoreDocumentNoRank<GPT>
) => Promise<PBReference | null>;
