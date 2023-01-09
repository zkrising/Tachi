import type { integer } from "../types";
import type { ChartDocument } from "./documents";
import type {
	ConfOptionalMetrics,
	ConfDerivedMetrics,
	GPTString,
	ConfProvidedMetrics,
} from "./game-config";

// WARNING! THIS FILE IS VERY COMPLEX. THERE IS SOME HIGH-TIER TYPESCRIPT MAGIC GOING
// ON HERE.

// The rough outline is that Tachi allows games to have up to 5 kinds of metrics
// "DECIMAL" | "INTEGER" | "ENUM" | "GRAPH" and "NULLABLE_GRAPH".

// Metrics themselves then come in three groups:
// - Provided: They **must** be provided for a score import to be usable
// - Derived: They **will** be put on a score document, but are a function
// of the provided metrics and the chart this score is on (i.e. Grades for IIDX)
// - Additional: They **may** exist. We want to store them if they exist, but don't
// mandate their existence (i.e. fast/slow/maxCombo)

interface ConfDecimalScoreMetricNormal {
	type: "DECIMAL";

	validate: (v: number) => string | true;

	// This exists to allow DecimalScoreMetric.chartDependentMax.
	chartDependentMax?: never;
}

interface ConfIntegerScoreMetricNormal {
	type: "INTEGER";

	validate: (v: number) => string | true;

	// see above
	chartDependentMax?: never;
}

interface ConfDecimalScoreMetricChartDependent {
	type: "DECIMAL";

	/**
	 * Is the maximum/minimum value of this metric chart dependent?
	 *
	 * @example: IIDX's EX Score is upperbounded at 2x the chart's notecount.
	 */
	chartDependentMax: true;
}

interface ConfIntegerScoreMetricChartDependent {
	type: "INTEGER";

	/**
	 * Is the maximum/minimum value of this metric chart dependent?
	 *
	 * @example: IIDX's EX Score is upperbounded at 2x the chart's notecount.
	 */
	chartDependentMax: true;
}

export type ConfDecimalScoreMetric =
	| ConfDecimalScoreMetricChartDependent
	| ConfDecimalScoreMetricNormal;

export type ConfIntegerScoreMetric =
	| ConfIntegerScoreMetricChartDependent
	| ConfIntegerScoreMetricNormal;

/**
 * A metric for a score that represents an enum.
 *
 * This is intended for use for things like clearTypes/lamps/grades. It may be
 * used for anything where a metric is in a known, ordered set of strings.
 */
export interface ConfEnumScoreMetric<V extends string> {
	type: "ENUM";
	values: ReadonlyArray<V>;

	// todo document this
	minimumRelevantValue: V;
}

/**
 * Corresponds to Array<number>
 */
export interface ConfGraphScoreMetric {
	type: "GRAPH";

	validate: (v: number) => string | true;
	size?: (v: number) => string | true;
}

/**
 * Corresponds to Array<number | null>.
 */
export interface ConfNullableGraphScoreMetric {
	type: "NULLABLE_GRAPH";

	validate: (v: number) => string | true;
	size?: (v: number) => string | true;
}

export type ConfScoreMetric =
	| ConfDecimalScoreMetric
	| ConfEnumScoreMetric<string>
	| ConfGraphScoreMetric
	| ConfIntegerScoreMetric
	| ConfNullableGraphScoreMetric;

/**
 * Given a Metric Type, turn it into its evaluated form. An IntegerScoreMetric
 * becomes an integer and an enum becomes a string union, etc.
 */
export type ExtractMetricValue<M extends ConfScoreMetric> = M extends ConfDecimalScoreMetric
	? number
	: M extends ConfIntegerScoreMetric
	? integer
	: M extends ConfEnumScoreMetric<infer V>
	? V
	: M extends ConfGraphScoreMetric
	? Array<number>
	: M extends ConfNullableGraphScoreMetric
	? Array<number | null>
	: never;

/**
 * Extract all the names of enum types from this record of score metrics.
 *
 * This is used for enforcing the "default enum" for a GPT. All games have to have
 * a default, preferred enum, for things like folder raises and graphs.
 *
 * For most games, this will be "grade" or "lamp". However, we need a typesafe way
 * of checking that this metric is an enum.
 *
 * Please ignore how magical this type is. I'm sorry. You aren't expected to understand
 * this.
 *
 * @example
 * ExtractEnumMetricNames<{ score: { type: "INTEGER" } }, grade: { type: "ENUM" ... },
 *  lamp: { type: "ENUM", ... }>
 * would return a type of "grade" | "lamp"
 */
export type ExtractEnumMetricNames<R extends Record<string, ConfScoreMetric>> = {
	[K in keyof R]: R[K] extends ConfEnumScoreMetric<infer _> ? K : never;
}[keyof R];

/**
 * What are all the metrics available for this GPT?
 */
export type AllConfMetrics = {
	[GPT in GPTString]: ConfDerivedMetrics[GPT] &
		ConfOptionalMetrics[GPT] &
		ConfProvidedMetrics[GPT];
};

/**
 * Get the string values that can be part of this enum.
 *
 * @usage GetEnumValue<"iidx:SP", "lamp"> = "FAILED" | "ASSIST CLEAR" | "EASY CLEAR" ...
 */
export type GetEnumValue<
	GPT extends GPTString,
	MetricName extends ExtractEnumMetricNames<AllConfMetrics[GPT]>
> = AllConfMetrics[GPT][MetricName] extends ConfEnumScoreMetric<infer EnumValues>
	? EnumValues
	: never;

/**
 * Turn a record of ConfigScoreMetrics into their actual literal values.
 *
 * @example ExtractMetrics<{
 *     score: ConfIntegerScoreMetric; lamp: ConfEnumScoreMetric<"FAILED"|"CLEAR">
 * }>
 * will equal
 * { score: integer; lamp: { string: "FAILED" | "CLEAR "..., index: number } }
 */
export type ExtractMetrics<R extends Record<string, ConfScoreMetric>> = {
	-readonly [K in keyof R]: ExtractMetricValue<R[K]>;
};

// We want some signatures for implementing metric "derivers".
// This complex type nonsense effectively gives us a typesafe form for:
// MetricDeriver<"iidx:SP", number>
// (metrics: IIDXSPMetrics, chart: Chart<"iidx:SP"> ) => number

export type DerivedMetricValue = Array<number | null> | Array<number> | integer | number | string;

export type MetricValue = ExtractMetricValue<ConfScoreMetric>;

export type MetricDeriver<
	GPT extends GPTString,
	// possible return values
	// from a derived fn
	V extends DerivedMetricValue = DerivedMetricValue
> = (mandatoryMetrics: ExtractMetrics<ConfProvidedMetrics[GPT]>, chart: ChartDocument<GPT>) => V;

/**
 * A function that will derive this metric, given a function of other metrics and
 * a chart for this GPT.
 */
export type ScoreMetricDeriver<M extends ConfScoreMetric, GPT extends GPTString> =
	// graph score metrics correspond to Array<number>
	M extends ConfGraphScoreMetric
		? MetricDeriver<GPT, Array<number>>
		: // nullable graphs correspond to Array<number | null>
		M extends ConfNullableGraphScoreMetric
		? MetricDeriver<GPT, Array<number | null>>
		: // enums correspond to their string unions ("FAILED"|"CLEAR")
		M extends ConfEnumScoreMetric<infer V>
		? MetricDeriver<GPT, V>
		: // the other two are obvious
		M extends ConfIntegerScoreMetric
		? MetricDeriver<GPT, integer>
		: MetricDeriver<GPT, number>;
