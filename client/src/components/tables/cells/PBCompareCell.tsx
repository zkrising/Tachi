import { FormatMillions } from "util/misc";
import React from "react";
import { COLOUR_SET, Game, PBScoreDocument, Playtype } from "tachi-common";
import { ConfScoreMetric } from "tachi-common/types/metrics";

export default function PBCompareCell({
	base,
	compare,
	game,
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
	} else {
		// @ts-expect-error yeah this index will work sorry
		status = cmp(base.scoreData[metric], compare.scoreData[metric]);
	}

	let scoreRenderFn = (k: number) => k.toString();
	let shouldShowPercent = false;
	let shouldPrioritisePercent = false;

	switch (game) {
		case "chunithm":
		case "gitadora":
		case "usc":
		case "sdvx":
		case "popn":
		case "wacca":
		case "museca":
			scoreRenderFn = FormatMillions;
			shouldShowPercent = false;
			break;
		case "jubeat":
			scoreRenderFn = FormatMillions;
			shouldShowPercent = true;
			shouldPrioritisePercent = true;
			break;
		case "bms":
		case "iidx":
			scoreRenderFn = (k: number) => k.toString();
			shouldShowPercent = true;
			break;
	}

	const fmtCmpPercent = fmtNum(
		(base?.scoreData.percent ?? 0) - (compare?.scoreData.percent ?? 0),
		2,
		"%"
	);
	const cmpScore = (base?.scoreData.score ?? 0) - (compare?.scoreData.score ?? 0);
	const cmpLamp = (base?.scoreData.lampIndex ?? 0) - (compare?.scoreData.lampIndex ?? 0);

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
				<></>
			) : (
				<>
					{shouldPrioritisePercent ? (
						<>
							<strong>{fmtCmpPercent}</strong>
							{shouldShowPercent && (
								<>
									<br />
									<small>
										({(cmpScore > 0 ? "+" : "") + scoreRenderFn(cmpScore)})
									</small>
								</>
							)}
						</>
					) : (
						<>
							<strong>{(cmpScore > 0 ? "+" : "") + scoreRenderFn(cmpScore)}</strong>
							{shouldShowPercent && (
								<>
									<br />
									<small>({fmtCmpPercent})</small>
								</>
							)}
						</>
					)}
				</>
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
