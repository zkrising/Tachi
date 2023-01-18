import { UppercaseFirst } from "util/misc";
import React from "react";
import { SetState } from "types/react";
import { GamePTConfig, GetScoreMetrics } from "tachi-common";
import { ZTableTHProps } from "./TachiTable";

export default function SelectableCompareType({
	metric,
	setMetric,
	changeSort,
	currentSortMode,
	reverseSort,
	gptConfig,
}: {
	metric: string;
	setMetric: SetState<string>;
	gptConfig: GamePTConfig;
} & ZTableTHProps) {
	return (
		<th>
			<select
				onChange={(v) => setMetric(v.target.value)}
				value={metric}
				style={{
					backgroundColor: "#131313",
					border: "none",
					color: "#ffffff",
					fontSize: "inherit",
					font: "inherit",
					textAlign: "center",
				}}
			>
				{GetScoreMetrics(gptConfig, ["DECIMAL", "INTEGER", "ENUM"]).map((e) => (
					<option value={e}>Vs. ({UppercaseFirst(e)})</option>
				))}
			</select>
			<br />
			<span onClick={() => changeSort("Vs.")}>
				<i
					className={`flaticon2-arrow-up icon-sm sort-icon ${
						currentSortMode === "Vs." && reverseSort ? "active" : ""
					}`}
				></i>
				<i
					className={`flaticon2-arrow-down icon-sm sort-icon ${
						currentSortMode === "Vs." && !reverseSort ? "active" : ""
					}`}
				></i>
			</span>
		</th>
	);
}
