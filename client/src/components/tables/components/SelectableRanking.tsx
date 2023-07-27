import useLUGPTSettings from "components/util/useLUGPTSettings";
import React from "react";
import { SetState } from "types/react";
import Icon from "components/util/Icon";
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
			<div onClick={() => changeSort("Site Ranking")}>
				<div className="d-flex flex-column text-nowrap gap-1">
					<span className="d-flex justify-content-center gap-1">
						<Icon
							type="arrow-up"
							className={
								currentSortMode === "Rating" && reverseSort
									? "opacity-100"
									: "opacity-25"
							}
						/>
						<Icon
							type="arrow-down"
							className={
								currentSortMode === "Rating" && !reverseSort
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
