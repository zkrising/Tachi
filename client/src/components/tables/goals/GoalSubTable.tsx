import { ChangeOpacity } from "util/color-opacity";
import { NumericSOV, StrSOV } from "util/sorts";
import React from "react";
import { COLOUR_SET } from "tachi-common";
import { GamePT } from "types/react";
import { GoalSubDataset } from "types/tables";
import TimestampCell from "../cells/TimestampCell";
import UserCell from "../cells/UserCell";
import TachiTable, { Header } from "../components/TachiTable";
import GoalSubTitleCell from "../cells/GoalSubTitleCell";

export default function GoalSubTable({
	game,
	playtype,
	dataset,
	showUser = false,
	small = false,
}: GamePT & { dataset: GoalSubDataset; showUser?: boolean; small?: boolean }) {
	const headers: Header<GoalSubDataset[0]>[] = [
		["Goal", "Goal", StrSOV((x) => x.__related.goal.name)],
		[
			"Progress",
			"Progress",
			NumericSOV((x) => (x.progress === null ? -Infinity : x.progress / x.outOf)),
		],
		["Goal Set", "Goal Set", NumericSOV((x) => x.timeSet)],
	];

	if (showUser) {
		headers.unshift(["User", "User", StrSOV((x) => x.__related.user.username)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Goals"
			noTopDisplayStr={small}
			searchFunctions={
				!small
					? {
							user: (k) => k.__related.user.username,
							goal: (k) => k.__related.goal.name,
							timestamp: (k) => k.timeAchieved,
					  }
					: undefined
			}
			rowFunction={(d) => (
				<tr>
					{showUser && (
						<UserCell game={game} playtype={playtype} user={d.__related.user} />
					)}
					<GoalSubTitleCell game={game} playtype={playtype} data={d} />
					<td
						style={{
							backgroundColor: d.achieved
								? ChangeOpacity(COLOUR_SET.green, 0.2)
								: ChangeOpacity(COLOUR_SET.red, 0.2),
						}}
					>
						{d.achieved ? (
							<b>Achieved!</b>
						) : (
							<>
								<b>{d.progressHuman ?? "N/A"}</b>
								<small>/{d.outOfHuman}</small>
							</>
						)}
					</td>
					<TimestampCell time={d.timeSet} />
				</tr>
			)}
		/>
	);
}
