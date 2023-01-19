import { ChangeOpacity } from "util/color-opacity";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Muted from "components/util/Muted";
import React from "react";
import { ChartDocument, COLOUR_SET } from "tachi-common";
import MiniTable from "../components/MiniTable";
import RatingSystemPart from "./RatingSystemPart";

const COLOUR_LOOKUP = {
	Beginner: COLOUR_SET.paleBlue,
	Easy: COLOUR_SET.green,
	Medium: COLOUR_SET.vibrantYellow,
	Hard: COLOUR_SET.red,
	Expert: COLOUR_SET.pink,
	Edit: COLOUR_SET.gray,
};

export default function ITGDifficultyCell({ chart }: { chart: ChartDocument<"itg:Stamina"> }) {
	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(
					COLOUR_LOOKUP[chart.data.difficultyTag] ?? COLOUR_SET.gray,
					0.2
				),
				minWidth: "80px",
			}}
		>
			<QuickTooltip
				wide
				tooltipContent={
					<MiniTable headers={["Breakdown"]} colSpan={2}>
						<tr>
							<td>Total</td>
							<td>{chart.data.breakdown.total}</td>
						</tr>
						<tr>
							<td>Detailed</td>
							<td>{chart.data.breakdown.detailed}</td>
						</tr>
						<tr>
							<td>Simplified</td>
							<td>{chart.data.breakdown.simplified}</td>
						</tr>
					</MiniTable>
				}
			>
				<div>
					<span>
						{chart.data.difficultyTag}: {chart.level} [
						{chart.data.primaryBPM?.toFixed() ?? "???"}]
					</span>
					<br />
					<Muted>{chart.data.charter}</Muted>
					<RatingSystemPart chart={chart} game="itg" />
				</div>
			</QuickTooltip>
		</td>
	);
}
