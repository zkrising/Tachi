import type { integer } from "../types";
import type { ChartDocument } from "./documents";
import type { GPTString } from "./game-config";

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
export interface EnumScoreMetric<V extends string = string> {
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
	| EnumScoreMetric
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
	: M extends EnumScoreMetric
	? EnumValue<M["values"][number]>
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
	[K in keyof R]: R[K] extends EnumScoreMetric ? K : never;
}[keyof R];

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

export type MetricDeriver<
	M extends Record<string, PossibleMetrics>,
	GPT extends GPTString,
	V extends PossibleMetrics
> = (mandatoryMetrics: M, chart: ChartDocument<GPT>) => V;

export type DerivedDecimalScoreMetric<
	M extends Record<string, PossibleMetrics>,
	GPT extends GPTString
> = DecimalScoreMetric & { deriver: MetricDeriver<M, GPT, number> };

export type DerivedIntegerScoreMetric<
	M extends Record<string, PossibleMetrics>,
	GPT extends GPTString
> = IntegerScoreMetric & { deriver: MetricDeriver<M, GPT, integer> };

export type DerivedEnumScoreMetric<
	M extends Record<string, PossibleMetrics>,
	GPT extends GPTString,
	E extends string = string
> = EnumScoreMetric<E> & { deriver: MetricDeriver<M, GPT, EnumValue<E>> };

export type DerivedGraphScoreMetric<
	M extends Record<string, PossibleMetrics>,
	GPT extends GPTString
> = GraphScoreMetric & { deriver: MetricDeriver<M, GPT, Array<number>> };

/**
 * A score metric with a "deriver" function that creates it from mandatoryScoreMetrics
 * and a chart document.
 */
export type DerivedScoreMetric<
	M extends Record<string, PossibleMetrics>,
	GPT extends GPTString,
	Enum extends string = string
> =
	| DerivedDecimalScoreMetric<M, GPT>
	| DerivedEnumScoreMetric<M, GPT, Enum>
	| DerivedGraphScoreMetric<M, GPT>
	| DerivedIntegerScoreMetric<M, GPT>;
