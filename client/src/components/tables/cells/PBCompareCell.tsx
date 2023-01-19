import React from "react";
import { COLOUR_SET, Game, PBScoreDocument, Playtype } from "tachi-common";
import { ConfScoreMetric } from "tachi-common/types/metrics";

export default function PBCompareCell({
	base,
	compare,
	metricConf,
	metric,
}: {
	base: PBScoreDocument | null;
	compare: PBScoreDocument | null;
	game: Game;
	playtype: Playtype;
	metricConf: ConfScoreMetric;
	metric: string;
}) {
	let status: "win" | "draw" | "lose";

	let delta: number | null = null;

	// wut?
	if (!base && !compare) {
		status = "draw";
	} else if (!base) {
		status = "lose";
	} else if (!compare) {
		status = "win";
	} else if (metricConf.type === "ENUM") {
		// @ts-expect-error yeah this index will work sorry
		status = cmp(base.scoreData.enumIndexes[metric], compare.scoreData.enumIndexes[metric]);
		// @ts-expect-error yeah this index will work sorry
		delta = base.scoreData.enumIndexes[metric] - compare.scoreData.enumIndexes[metric];
	} else {
		// @ts-expect-error yeah this index will work sorry
		status = cmp(base.scoreData[metric], compare.scoreData[metric]);
		// @ts-expect-error yeah this index will work sorry
		delta = base.scoreData[metric] - compare.scoreData[metric];
	}

	return (
		<td
			style={{
				color:
					status === "win"
						? COLOUR_SET.green
						: status === "draw"
						? COLOUR_SET.gold
						: COLOUR_SET.red,
				borderLeft: "1px black double",
				borderRight: "1px black double",
			}}
		>
			{metricConf.type === "ENUM" ? (
				<>
					{/* @ts-expect-error this is fine */}
					{(delta > 0 ? "+" : "") + delta}
				</>
			) : (
				(metricConf.type === "DECIMAL" || metricConf.type === "INTEGER") && (
					<strong>
						{/* @ts-expect-error this is fine */}
						{(delta > 0 ? "+" : "") +
							//  @ts-expect-error this is fine
							metricConf.formatter(delta)}
					</strong>
				)
			)}
		</td>
	);
}

function cmp(a: number, b: number) {
	if (a === b) {
		return "draw";
	} else if (a > b) {
		return "win";
	}

	return "lose";
}

function fmtNum(num: number, fixed?: number, suffix?: string) {
	let str = fixed ? num.toFixed(fixed) : num.toString();

	if (num >= 0) {
		str = `+${str}`;
	}

	if (suffix) {
		str += suffix;
	}

	return str;
}
