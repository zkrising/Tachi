import { InvalidScoreFailure } from "../common/converter-failures";
import { GPT_SERVER_IMPLEMENTATIONS } from "game-implementations/game-implementations";
import { GetGPTConfig, GetGPTString } from "tachi-common";
import type { ChartDocument, GPTString, ScoreDocument } from "tachi-common";
import type { ConfScoreMetric } from "tachi-common/types/metrics";

/**
 * Checks if a score passes all of its validation checks. This tests gpt specific
 * things, like whether this passes the validators defined in gptConfig, or whether
 * it passes the chart-dependent validators defined in the gpt server implementation.
 *
 * @returns nothing. This will throw an InvalidScoreFailure on error.
 */
export function ValidateScore(score: ScoreDocument, chart: ChartDocument): void {
	const gptString = GetGPTString(score.game, score.playtype);
	const gptConfig = GetGPTConfig(gptString);

	const errs: Array<string> = [];

	ValidateMetrics(
		errs,
		gptConfig.providedMetrics,
		gptString,
		score,
		chart,
		// @ts-expect-error ughhh
		(s, m) => s.scoreData[m]
	);
	ValidateMetrics(
		errs,
		gptConfig.derivedMetrics,
		gptString,
		score,
		chart,
		// @ts-expect-error ughhh
		(s, m) => s.scoreData[m]
	);

	ValidateMetrics(
		errs,
		gptConfig.optionalMetrics,
		gptString,
		score,
		chart,
		// @ts-expect-error ughhh
		(s, m) => s.scoreData.optional[m],
		true
	);

	if (errs.length > 0) {
		const errorStr = errs.length === 1 ? "error" : "errors";

		throw new InvalidScoreFailure(`Got ${errs.length} ${errorStr} when validating score:
${errs.join("\n")}`);
	}
}

function ValidateMetrics(
	errs: Array<string>,
	metrics: Record<string, ConfScoreMetric>,
	gptString: GPTString,
	score: ScoreDocument,
	chart: ChartDocument,
	valueGetter: (s: ScoreDocument, metric: string) => any,
	optional?: boolean
) {
	const gptImpl = GPT_SERVER_IMPLEMENTATIONS[gptString];

	for (const [metric, conf] of Object.entries(metrics)) {
		const scoreVal: any = valueGetter(score, metric);

		if (optional && (scoreVal === undefined || scoreVal === null)) {
			continue;
		}

		switch (conf.type) {
			case "ENUM": {
				if (!conf.values.includes(scoreVal)) {
					errs.push(
						`Invalid value for ${metric}, got ${scoreVal}, but expected any of ${conf.values.join(
							", "
						)}.`
					);
				}

				break;
			}

			case "INTEGER":
			case "DECIMAL": {
				if (conf.type === "INTEGER" && !Number.isSafeInteger(scoreVal)) {
					errs.push(
						`Invalid value for ${metric}, got ${scoreVal}, but expected an integer.`
					);
				} else if (!Number.isFinite(scoreVal)) {
					errs.push(
						`Invalid value for ${metric}, got ${scoreVal}, but expected a finite number.`
					);
				}

				let err: string | true;

				if (conf.chartDependentMax) {
					// @ts-expect-error hack, this is fine. don't worry.
					err = gptImpl.validators[metric](scoreVal, chart);
				} else {
					err = conf.validate(scoreVal);
				}

				if (typeof err === "string") {
					errs.push(`Invalid value for ${metric}, ${err} Got ${scoreVal}.`);
				}

				break;
			}

			case "GRAPH":
			case "NULLABLE_GRAPH": {
				if (!Array.isArray(scoreVal)) {
					errs.push(`Invalid value for metric ${metric}, expected an array.`);
					break;
				}

				for (const v of scoreVal) {
					if (conf.type === "NULLABLE_GRAPH" && v === null) {
						continue;
					}

					const err = conf.validate(v);

					if (typeof err === "string") {
						errs.push(`Invalid value for metric ${metric}, ${err}, got ${v}.`);
					}
				}

				if (conf.size) {
					const err = conf.size(scoreVal.length);

					if (typeof err === "string") {
						errs.push(
							`Invalid size of metric ${metric}, ${err}, got an array of size ${scoreVal.length}.`
						);
					}
				}
			}
		}
	}
}
