import { UppercaseFirst } from "util/misc";
import React from "react";
import { SetState } from "types/react";
import { GamePTConfig, GetScoreMetrics } from "tachi-common";
import Icon from "components/util/Icon";
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
				className="my-1 bg-dark border-0 text-body fw-bold rounded focus-ring focus-ring-light"
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
