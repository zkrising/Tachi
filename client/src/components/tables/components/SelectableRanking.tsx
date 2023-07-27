import useLUGPTSettings from "components/util/useLUGPTSettings";
import React from "react";
import { SetState } from "types/react";
import { RankingViewMode } from "../cells/RankingCell";
import SortableTH from "./SortableTH";
import { ZTableTHProps } from "./TachiTable";

export default function SelectableRanking({
	rankingViewMode,
	setRankingViewMode,
	changeSort,
	currentSortMode,
	reverseSort,
}: {
	rankingViewMode: RankingViewMode;
	setRankingViewMode: SetState<RankingViewMode>;
} & ZTableTHProps) {
	const { settings } = useLUGPTSettings();

	if (
		rankingViewMode === "both-if-self" ||
		rankingViewMode === "global-no-switch" ||
		!settings ||
		settings.rivals.length === 0
	) {
		return (
			<SortableTH
				changeSort={changeSort}
				currentSortMode={currentSortMode}
				name="Ranking"
				reverseSort={reverseSort}
				shortName="Ranking"
			/>
		);
	}

	return (
		<th>
			<select
				onChange={(v) => setRankingViewMode(v.target.value as RankingViewMode)}
				value={rankingViewMode}
				className="my-1 bg-dark border-0 text-body fw-bold rounded focus-ring focus-ring-light"
			>
				<option value="global">Global Ranking</option>
				<option value="rival">Rival Ranking</option>
			</select>
			<br />
			<span onClick={() => changeSort("Site Ranking")}>
				<i
					className={`flaticon2-arrow-up icon-sm sort-icon ${
						currentSortMode === "Site Ranking" && reverseSort ? "active" : ""
					}`}
				></i>
				<i
					className={`flaticon2-arrow-down icon-sm sort-icon ${
						currentSortMode === "Site Ranking" && !reverseSort ? "active" : ""
					}`}
				></i>
			</span>
		</th>
	);
}
