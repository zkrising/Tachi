import useLUGPTSettings from "components/util/useLUGPTSettings";
import React from "react";
import { integer } from "rg-stats/js/util/types";
import { PBScoreDocument } from "tachi-common";

export type RankingViewMode = "global" | "rival" | "both-if-self" | "global-no-switch";

export default function RankingCell({
	rankingData,
	userID,
	rankingViewMode,
}: {
	rankingData: PBScoreDocument["rankingData"];
	userID: integer;
	rankingViewMode: RankingViewMode;
}) {
	const { settings } = useLUGPTSettings();

	switch (rankingViewMode) {
		case "global":
		case "global-no-switch":
			return (
				<td>
					<strong>#{rankingData.rank}</strong>
					<small>/{rankingData.outOf}</small>
				</td>
			);
		case "rival":
			if (!settings) {
				return (
					<td>
						No Settings, yet tried to view rival stats? not possible. how'd you get
						here. report this.
					</td>
				);
			}

			if (settings?.userID !== userID) {
				return (
					<td>
						<strong>N/A</strong>
					</td>
				);
			}

			return (
				<td>
					<strong>#{rankingData.rivalRank}</strong>
					<small>/{settings.rivals.length + 1}</small>
				</td>
			);

		case "both-if-self":
			if (settings?.userID === userID && rankingData.rivalRank !== null) {
				return (
					<td>
						<strong>Global #{rankingData.rank}</strong>
						<small>/{rankingData.outOf}</small>
						<br />
						<strong>Rival #{rankingData.rivalRank}</strong>
						<small>/{settings.rivals.length + 1}</small>
					</td>
				);
			}

			return (
				<td>
					<strong>#{rankingData.rank}</strong>
					<small>/{rankingData.outOf}</small>
				</td>
			);
	}
}
