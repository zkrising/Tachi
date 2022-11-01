import { FormatMillions } from "util/misc";
import React from "react";
import { COLOUR_SET, Game, PBScoreDocument, Playtype } from "tachi-common";
import { ESDCompare } from "tachi-common/lib/esd";
import Muted from "components/util/Muted";

export default function PBCompareCell({
	base,
	compare,
	game,
	playtype,
	compareType,
	shouldESD,
}: {
	base: PBScoreDocument | null;
	compare: PBScoreDocument | null;
	game: Game;
	playtype: Playtype;
	compareType: "score" | "lamp";
	shouldESD: boolean;
}) {
	let status: "win" | "draw" | "lose";

	// wut?
	if (!base && !compare) {
		status = "draw";
	} else if (!base) {
		status = "lose";
	} else if (!compare) {
		status = "win";
	} else if (compareType === "score") {
		status = cmp(base.scoreData.score, compare.scoreData.score);
	} else {
		status = cmp(base.scoreData.lampIndex, compare.scoreData.lampIndex);
	}

	let scoreRenderFn = (k: number) => k.toString();

	switch (game) {
		case "chunithm":
		case "ddr":
		case "gitadora":
		case "jubeat":
		case "maimai":
		case "usc":
		case "sdvx":
		case "popn":
		case "wacca":
		case "museca":
			scoreRenderFn = FormatMillions;
			break;
		case "bms":
		case "iidx":
			scoreRenderFn = (k: number) => k.toString();
			break;
	}

	const fmtCmpPercent = fmtNum(
		(base?.scoreData.percent ?? 0) - (compare?.scoreData.percent ?? 0),
		2,
		"%"
	);
	const cmpScore = (base?.scoreData.score ?? 0) - (compare?.scoreData.score ?? 0);
	const cmpLamp = (base?.scoreData.lampIndex ?? 0) - (compare?.scoreData.lampIndex ?? 0);

	let esdDiff;

	if (shouldESD) {
		if (base?.scoreData.esd && compare?.scoreData.esd) {
			esdDiff = ESDCompare(compare.scoreData.esd, base.scoreData.esd);
		}
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
			{compareType === "score" ? (
				<>
					<strong>{(cmpScore > 0 ? "+" : "") + scoreRenderFn(cmpScore)}</strong>
					<br />
					<small>({fmtCmpPercent})</small>
					{esdDiff !== undefined && (
						<>
							<br />
							{esdDiff.toFixed(2) === "0.00" ? (
								<Muted>Negligable Difference</Muted>
							) : (
								<Muted>
									Relative: {(esdDiff > 0 ? "+" : "") + esdDiff.toFixed(2)}
								</Muted>
							)}
						</>
					)}
				</>
			) : (
				<>
					<strong>{(cmpLamp > 0 ? "+" : "") + cmpLamp}</strong>
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
