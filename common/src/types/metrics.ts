import type { integer } from "../types";
import type { ChartDocument } from "./documents";
import type {
	ConfOptionalMetrics,
	ConfDerivedMetrics,
	GPTString,
	ConfProvidedMetrics,
} from "./game-config";

export type DecimalMetricValidator<GPT extends GPTString> = (
	metric: number,
	chart: ChartDocument<GPT>
) => string | true;
export type IntegerMetricValidator<GPT extends GPTString> = (
	metric: integer,
	chart: ChartDocument<GPT>
) => string | true;
export type GraphMetricValidator<GPT extends GPTString> = (
	metric: Array<number>,
	chart: ChartDocument<GPT>
) => string | true;

export interface ConfDecimalScoreMetric {
	type: "DECIMAL";
}

export interface ConfIntegerScoreMetric {
	type: "INTEGER";
}

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
}

/**
 * Corresponds to Array<number | null>.
 */
export interface ConfNullableGraphScoreMetric {
	type: "NULLABLE_GRAPH";
}

export type ConfScoreMetric =
	| ConfDecimalScoreMetric
	| ConfEnumScoreMetric<string>
	| ConfGraphScoreMetric
	| ConfIntegerScoreMetric
	| ConfNullableGraphScoreMetric;

/**
 * When we store and interact with enum values, we want them to be both strings
 * and integers.
 */
export interface EnumValue<S extends string> {
	string: S;
	index: integer;
}

/**
 * Given a Metric Type, turn it into its evaluated form. An IntegerScoreMetric
 * becomes an integer, etc.
 */
export type ExtractMetricType<M extends ConfScoreMetric> = M extends ConfDecimalScoreMetric
	? number
	: M extends ConfIntegerScoreMetric
	? integer
	: M extends ConfEnumScoreMetric<infer V>
	? EnumValue<V>
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

export type AllMetrics = {
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
	MetricName extends ExtractEnumMetricNames<AllMetrics[GPT]>
> = AllMetrics[GPT][MetricName] extends ConfEnumScoreMetric<infer EnumValues> ? EnumValues : never;

type PossibleMetrics = ExtractMetricType<ConfScoreMetric>;

/**
 * Turn a record of ScoreMetrics into their actual literal values.
 *
 * @example ExtractMetrics<{ score: IntegerScoreMetric; lamp: EnumScoreMetric<"FAILED"|"CLEAR"> }>
 * will equal
 * { score: integer; lamp: "FAILED" | "CLEAR" }
 */
export type ExtractMetrics<R extends Record<string, ConfScoreMetric>> = {
	[K in keyof R]: ExtractMetricType<R[K]>;
};

export type DerivedMetricValue = Array<number | null> | Array<number> | integer | number | string;

export type MetricDeriver<
	M extends Record<string, PossibleMetrics>,
	GPT extends GPTString,
	// possible return values
	// from a derived fn
	V extends DerivedMetricValue = DerivedMetricValue
> = (mandatoryMetrics: M, chart: ChartDocument<GPT>) => V;

/**
 * A function that will derive this metric, given a function of other metrics and
 * a chart for this GPT.
 */
export type ScoreMetricDeriver<M extends ConfScoreMetric, GPT extends GPTString> =
	// graph score metrics correspond to Array<number>
	M extends ConfGraphScoreMetric
		? MetricDeriver<ExtractMetrics<ConfProvidedMetrics[GPT]>, GPT, Array<number>>
		: // nullable graphs correspond to Array<number | null>
		M extends ConfNullableGraphScoreMetric
		? MetricDeriver<ExtractMetrics<ConfProvidedMetrics[GPT]>, GPT, Array<number | null>>
		: // enums correspond to their string unions ("FAILED"|"CLEAR")
		M extends ConfEnumScoreMetric<infer V>
		? MetricDeriver<ExtractMetrics<ConfProvidedMetrics[GPT]>, GPT, V>
		: // the other two are obvious
		M extends ConfIntegerScoreMetric
		? MetricDeriver<ExtractMetrics<ConfProvidedMetrics[GPT]>, GPT, integer>
		: MetricDeriver<ExtractMetrics<ConfProvidedMetrics[GPT]>, GPT, number>;
