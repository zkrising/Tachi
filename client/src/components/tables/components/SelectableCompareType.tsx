import React from "react";
import { SetState } from "types/react";
import { ZTableTHProps } from "./TachiTable";

export default function SelectableCompareType({
	compareType,
	setCompareType,
	changeSort,
	currentSortMode,
	reverseSort,
}: {
	compareType: "score" | "lamp";
	setCompareType: SetState<"score" | "lamp">;
} & ZTableTHProps) {
	return (
		<th>
			<select
				onChange={(v) => setCompareType(v.target.value as "score" | "lamp")}
				value={compareType}
				style={{
					backgroundColor: "#131313",
					border: "none",
					color: "#ffffff",
					fontSize: "inherit",
					font: "inherit",
					textAlign: "center",
				}}
			>
				<option value="score">Vs. (Score)</option>
				<option value="lamp">Vs. (Lamp)</option>
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
