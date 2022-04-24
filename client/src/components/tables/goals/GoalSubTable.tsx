import { ChangeOpacity } from "util/color-opacity";
import { NumericSOV, StrSOV } from "util/sorts";
import GentleLink from "components/util/GentleLink";
import React from "react";
import {
	COLOUR_SET,
	GoalDocument,
	PublicUserDocument,
	GoalSubscriptionDocument,
} from "tachi-common";
import { GamePT } from "types/react";
import TimestampCell from "../cells/TimestampCell";
import UserCell from "../cells/UserCell";
import TachiTable, { Header } from "../components/TachiTable";

export type GoalSubDataset = (GoalSubscriptionDocument & {
	__related: {
		user: PublicUserDocument;
		goal: GoalDocument;
	};
})[];

export default function GoalSubTable({
	game,
	playtype,
	dataset,
}: GamePT & { dataset: GoalSubDataset }) {
	const headers: Header<GoalSubDataset[0]>[] = [
		["User", "User", StrSOV(x => x.__related.user.username)],
		["Goal", "Goal", StrSOV(x => x.__related.goal.name)],
		[
			"Progress",
			"Progress",
			NumericSOV(x => (x.progress === null ? -Infinity : x.progress / x.outOf)),
		],
		["Achieved On", "Achieved", NumericSOV(x => x.timeAchieved ?? -Infinity)],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Goals"
			searchFunctions={{
				user: k => k.__related.user.username,
				goal: k => k.__related.goal.name,
				timestamp: k => k.timeAchieved,
			}}
			rowFunction={d => (
				<tr>
					<UserCell game={game} playtype={playtype} user={d.__related.user} />
					<td>
						<GentleLink
							to={`/dashboard/games/${game}/${playtype}/targets/goals/${d.goalID}`}
						>
							{d.__related.goal.name}
						</GentleLink>
					</td>
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
								<b>{d.progress ?? "N/A"}</b>
								<small>/{d.outOfHuman}</small>
							</>
						)}
					</td>
					<TimestampCell time={d.timeAchieved} />
				</tr>
			)}
		/>
	);
}
