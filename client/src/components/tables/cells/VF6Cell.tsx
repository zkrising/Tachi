import { IsNullish } from "util/misc";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Volforce } from "rg-stats";
import {
	ChartDocument,
	GetGPTString,
	GetSpecificGPTConfig,
	PBScoreDocument,
	ScoreDocument,
} from "tachi-common";

type VF6GPTString = "sdvx:Single" | "usc:Keyboard" | "usc:Controller";

const SHORT_LAMPS = {
	CLEAR: "CLR",
	"EXCESSIVE CLEAR": "EXC",
	"ULTIMATE CHAIN": "UC",
} as const;

export default function VF6Cell({
	score,
	chart,
}: {
	score: ScoreDocument<VF6GPTString> | PBScoreDocument<VF6GPTString>;
	chart: ChartDocument<VF6GPTString>;
}) {
	const { user } = useContext(UserContext);
	const { settings } = useLUGPTSettings<VF6GPTString>();

	if (IsNullish(score.calculatedData.VF6)) {
		return <td>N/A</td>;
	}

	const vf6Target = settings?.preferences.gameSpecific.vf6Target;

	const gptConfig = GetSpecificGPTConfig<VF6GPTString>(
		GetGPTString(score.game, score.playtype) as VF6GPTString
	);

	const targets: Record<string, number | null> = {};

	if (vf6Target && score.userID === user?.id) {
		for (const lamp of ["CLEAR", "EXCESSIVE CLEAR", "ULTIMATE CHAIN"] as const) {
			if (
				score.scoreData.enumIndexes.lamp <=
				gptConfig.providedMetrics.lamp.values.indexOf(lamp)
			) {
				const expectedScore = InverseVF6(vf6Target, lamp, chart.levelNum);

				if (expectedScore === null) {
					targets[SHORT_LAMPS[lamp]] = null;
				} else {
					targets[SHORT_LAMPS[lamp]] = expectedScore;
					break;
				}
			}
		}
	}

	const maxVF = Volforce.calculateVF6(10_000_000, "PERFECT ULTIMATE CHAIN", chart.levelNum);

	return (
		<td>
			<strong className="underline-on-hover">{score.calculatedData.VF6}</strong>

			{vf6Target !== 0 && vf6Target && user?.id === score.userID && (
				<>
					<br />

					<div>
						{score.calculatedData.VF6! >= vf6Target ? (
							<small className="text-success">{vf6Target}VF Target Achieved!</small>
						) : vf6Target > maxVF ? (
							<small className="text-body-secondary">
								{vf6Target}VF Not Possible (Max {maxVF})
							</small>
						) : (
							Object.entries(targets).map(([k, v], i) => (
								<React.Fragment key={k}>
									<VF6TargetCell
										vf6Target={vf6Target!}
										targetScore={v}
										targetDelta={v === null ? null : v - score.scoreData.score}
										clearType={k}
										showClearType={i !== 0 || score.scoreData.lamp === "FAILED"}
									/>
									<br />
								</React.Fragment>
							))
						)}
					</div>
				</>
			)}
		</td>
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
	targetScore,
	vf6Target,
	clearType,
	showClearType,
}: {
	targetDelta: number | null;
	targetScore: number | null;
	vf6Target: number;
	clearType: string;
	showClearType: boolean;
}) {
	if (targetDelta === null || targetScore === null) {
		return (
			<small className="text-body-secondary">
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

	const div = targetDelta / 1_000_000;

	const fmt = `${div.toFixed(3)}m`;

	return (
		<small className="text-danger">
			{vf6Target}VF{showClearType ? ` w/ ${clearType}` : ""}: +{fmt} (
			{(targetScore / 1_000_000).toFixed(3)}
			m)
		</small>
	);
}
