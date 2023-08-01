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
		<th className="vstack gap-1 align-items-center justify-content-center">
			<select
				onChange={(v) => setMetric(v.target.value)}
				value={metric}
				className="my-1 border-0 text-body fw-bold rounded focus-ring focus-ring-light"
			>
				{GetScoreMetrics(gptConfig, ["DECIMAL", "INTEGER", "ENUM"]).map((e) => (
					<option value={e}>Vs. ({UppercaseFirst(e)})</option>
				))}
			</select>
			<div onClick={() => changeSort("Vs.")}>
				<div className="d-flex justify-content-center text-nowrap gap-1">
					<Icon
						type="arrow-up"
						className={
							currentSortMode === "Vs." && reverseSort ? "opacity-100" : "opacity-25"
						}
					/>
					<Icon
						type="arrow-down"
						className={
							currentSortMode === "Vs." && !reverseSort ? "opacity-100" : "opacity-25"
						}
					/>
				</div>
			</div>
		</th>
	);
}
