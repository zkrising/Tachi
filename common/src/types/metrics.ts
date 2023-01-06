import type { integer } from "../types";
import type { ChartDocument } from "./documents";
import type { OptionalMetrics, DerivedMetrics, GPTString, ProvidedMetrics } from "./game-config";

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

/**
 * A metric for a score that's a floating point number.
 */
export interface DecimalScoreMetric {
	type: "DECIMAL";
}

/**
 * A metric for a score that's an integer.
 */
export interface IntegerScoreMetric {
	type: "INTEGER";
}

/**
 * A metric for a score that represents an enum.
 *
 * This is intended for use for things like clearTypes/lamps/grades. It may be
 * used for anything where a metric is in a known, ordered set of strings.
 */
export interface EnumScoreMetric<V extends string> {
	type: "ENUM";
	values: ReadonlyArray<V>;

	// todo document this
	minimumRelevantValue: V;
}

/**
 * A metric for a score that represents an array of numbers.
 *
 * This is intended for use by graphs and other equivalent things.
 */
export interface GraphScoreMetric {
	type: "GRAPH";
}

export type ScoreMetric =
	| DecimalScoreMetric
	| EnumScoreMetric<string>
	| GraphScoreMetric
	| IntegerScoreMetric;

export interface EnumValue<S extends string> {
	string: S;
	index: integer; // technically incorrect, but whatever
}

/**
 * Given a Metric Type, turn it into its evaluated form. An IntegerScoreMetric
 * becomes an integer, etc.
 */
export type ExtractMetricType<M extends ScoreMetric> = M extends DecimalScoreMetric
	? number
	: M extends IntegerScoreMetric
	? integer
	: M extends EnumScoreMetric<infer V>
	? EnumValue<V>
	: M extends GraphScoreMetric
	? Array<number>
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
export type ExtractEnumMetricNames<R extends Record<string, ScoreMetric>> = {
	[K in keyof R]: R[K] extends EnumScoreMetric<infer _> ? K : never;
}[keyof R];

export type ExtractEnumValues<
	GPT extends GPTString,
	MetricName extends ExtractEnumMetricNames<
		DerivedMetrics[GPT] & OptionalMetrics[GPT] & ProvidedMetrics[GPT]
	>
> = (DerivedMetrics[GPT] &
	OptionalMetrics[GPT] &
	ProvidedMetrics[GPT])[MetricName] extends EnumScoreMetric<infer EnumValues>
	? EnumValues
	: never;

type PossibleMetrics = ExtractMetricType<ScoreMetric>;

/**
 * Turn a record of ScoreMetrics into their actual literal values.
 *
 * @example ExtractMetrics<{ score: IntegerScoreMetric; lamp: EnumScoreMetric<"FAILED"|"CLEAR"> }>
 * will equal
 * { score: integer; lamp: "FAILED" | "CLEAR" }
 */
export type ExtractMetrics<R extends Record<string, ScoreMetric>> = {
	[K in keyof R]: ExtractMetricType<R[K]>;
};

export type DerivedMetricValue = Array<number> | integer | number | string;

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
export type ScoreMetricDeriver<
	M extends ScoreMetric,
	GPT extends GPTString
> = M extends GraphScoreMetric
	? MetricDeriver<ExtractMetrics<ProvidedMetrics[GPT]>, GPT, Array<number>>
	: M extends EnumScoreMetric<infer V>
	? MetricDeriver<ExtractMetrics<ProvidedMetrics[GPT]>, GPT, V>
	: M extends IntegerScoreMetric
	? MetricDeriver<ExtractMetrics<ProvidedMetrics[GPT]>, GPT, integer>
	: MetricDeriver<ExtractMetrics<ProvidedMetrics[GPT]>, GPT, number>;
