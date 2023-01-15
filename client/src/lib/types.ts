import { Header } from "components/tables/components/TachiTable";
import { CSSProperties } from "react";
import {
	ChartDocument,
	ClassConfigs,
	Classes,
	ConfScoreMetrics,
	Difficulties,
	ExtractedClasses,
	GPTString,
	PBScoreDocument,
	ScoreDocument,
} from "tachi-common";
import { ExtractEnumMetricNames, GetEnumValue } from "tachi-common/types/metrics";

export type GPTEnumColours<GPT extends GPTString> = {
	// @ts-expect-error this is fine please do not worry
	[M in ExtractEnumMetricNames<ConfScoreMetrics[GPT]>]: Record<GetEnumValue<GPT, M>, string>;
};

export type GPTDifficultyColours<GPT extends GPTString> = Record<Difficulties[GPT], string>;

/**
 * Every GPT has to have some sort of "rating system" for charts defined.
 * The UI uses this to handle things like sorting on the difficulty cell.
 */
export type GPTRatingSystem<GPT extends GPTString> = {
	name: string;
	description: string;
	toNumber: (c: ChartDocument<GPT>) => number | null | undefined;
	toString: (c: ChartDocument<GPT>) => string | null | undefined;

	/**
	 * Does this rating system say this chart has strong individual differences
	 * between players?
	 */
	idvDifference: (c: ChartDocument<GPT>) => boolean | null | undefined;
};

export type GPTClassColours<GPT extends GPTString> = {
	[C in keyof ClassConfigs[GPT]]: {
		// @ts-expect-error it's kinda cool how TS lets me just uhh
		// ignore, errors
		// in the abhorrent stringly based typesystem i have created.
		// Whatever! This works.

		// string => bootstrap variant
		// css properties => css
		// null -> no styling
		[V in ClassConfigs[GPT][C]["values"][number]["id"]]:
			| "warning"
			| "danger"
			| "secondary"
			| "primary"
			| "info"
			| "success"
			| null
			| CSSProperties;
	};
};

export interface GPTClientImplementation<GPT extends GPTString = GPTString> {
	enumColours: GPTEnumColours<GPT>;
	difficultyColours: GPTDifficultyColours<GPT>;
	classColours: GPTClassColours<GPT>;

	/**
	 * Other than chart.level and chart.levelNum, what other rating systems exist
	 * for this game?
	 *
	 * You can use this to add things like tierlists (chart.data.ncTier, hcTier, etc.)
	 */
	ratingSystems: Array<GPTRatingSystem<GPT>>;

	/**
	 * What headers should be used when rendering scores in a table for this game?
	 */
	scoreHeaders: Array<Header<ScoreDocument<GPT> | PBScoreDocument<GPT>>>;
}
