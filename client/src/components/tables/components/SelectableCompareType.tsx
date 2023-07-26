import { UppercaseFirst } from "util/misc";
import React from "react";
import { SetState } from "types/react";
import { GamePTConfig, GetScoreMetrics } from "tachi-common";
import { ZTableTHProps } from "./TachiTable";
import Icon from "components/util/Icon";

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
			<div onClick={() => changeSort("Vs.")}>
				<div className="d-flex flex-column text-nowrap gap-1">
					<span className="d-flex justify-content-center gap-1">
						<Icon
							type="arrow-up"
							className={
								currentSortMode === "Vs." && reverseSort
									? "opacity-100"
									: "opacity-25"
							}
						/>
						<Icon
							type="arrow-down"
							className={
								currentSortMode === "Vs." && !reverseSort
									? "opacity-100"
									: "opacity-25"
							}
						/>
					</span>
				</div>
			</div>
		</th>
	);
}
