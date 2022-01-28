import QuickTooltip from "components/layout/misc/QuickTooltip";
import useUGPTSettings from "components/util/useUGPTSettings";
import React from "react";
import { Volforce } from "rg-stats";
import { ChartDocument, GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";
import MiniTable from "../components/MiniTable";

type VF6IDStrings = "sdvx:Single" | "usc:Keyboard" | "usc:Controller";

const SHORT_LAMPS = {
	CLEAR: "CLR",
	"EXCESSIVE CLEAR": "EXC",
	"ULTIMATE CHAIN": "UC",
} as const;

export default function VF6Cell({
	score,
	chart,
}: {
	score: ScoreDocument<VF6IDStrings> | PBScoreDocument<VF6IDStrings>;
	chart: ChartDocument<VF6IDStrings>;
}) {
	const { settings } = useUGPTSettings<VF6IDStrings>();

	if (IsNullish(score.calculatedData.VF6)) {
		return <td>N/A</td>;
	}

	const vf6Target = settings?.preferences.gameSpecific.vf6Target ?? 0.3;

	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	const targets: Record<string, number | null> = {};

	if (vf6Target) {
		for (const lamp of ["CLEAR", "EXCESSIVE CLEAR", "ULTIMATE CHAIN"] as const) {
			if (score.scoreData.lampIndex <= gptConfig.lamps.indexOf(lamp)) {
				const expectedScore = InverseVF6(vf6Target, lamp, chart.levelNum);

				if (expectedScore === null) {
					targets[SHORT_LAMPS[lamp]] = null;
				} else {
					targets[SHORT_LAMPS[lamp]] = expectedScore - score.scoreData.score;
					break;
				}
			}
		}
	}

	console.log(targets);

	return (
		<>
			<QuickTooltip
				wide
				tooltipContent={
					<>
						<MiniTable headers={[`Your Target`]}>
							<tr></tr>
							<tr></tr>
						</MiniTable>
					</>
				}
			>
				<td>
					<strong className="underline-on-hover">{score.calculatedData.VF6}</strong>
					<br />

					<div>
						{score.calculatedData.VF6! >= vf6Target ? (
							<small className="text-success">{vf6Target}VF Target Achieved!</small>
						) : Object.values(targets).every(k => k === null) ? (
							<small className="text-muted">{vf6Target}VF Not Possible</small>
						) : (
							Object.entries(targets).map(([k, v], i) => (
								<React.Fragment key={k}>
									<VF6TargetCell
										vf6Target={vf6Target!}
										targetDelta={v}
										clearType={k}
										showClearType={i !== 0}
									/>
									<br />
								</React.Fragment>
							))
						)}
					</div>
				</td>
			</QuickTooltip>
		</>
	);
}

function InverseVF6(
	vf6: number,
	lamp: "CLEAR" | "EXCESSIVE CLEAR" | "ULTIMATE CHAIN",
	level: number
) {
	try {
		return Volforce.inverseVF6(vf6, lamp, level);
	} catch (err) {
		return null;
	}
}

function VF6TargetCell({
	targetDelta,
	vf6Target,
	clearType,
	showClearType,
}: {
	targetDelta: number | null;
	vf6Target: number;
	clearType: string;
	showClearType: boolean;
}) {
	if (targetDelta === null) {
		return (
			<small className="text-muted">
				{vf6Target}VF w/ {clearType}: Not Possible
			</small>
		);
	}

	if (targetDelta < 0) {
		return (
			<small className="text-warning">
				Score is {vf6Target}VF w/ {clearType}
			</small>
		);
	}

	const div = targetDelta / 1_000;

	let fmt;
	if (div >= 1_000) {
		fmt = `${(div / 1_000).toFixed(3)}m`;
	} else {
		fmt = `${div.toFixed(2)}k`;
	}

	return (
		<small className="text-danger">
			{vf6Target}VF{showClearType ? ` w/ ${clearType}` : ""}: +{fmt}
		</small>
	);
}
