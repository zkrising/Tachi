import { JoinJSX } from "util/misc";
import GentleLink from "components/util/GentleLink";
import Muted from "components/util/Muted";
import React from "react";
import { QuestDocument } from "tachi-common";
import { GamePT } from "types/react";
import { GoalSubDataset } from "types/tables";

export default function GoalSubTitleCell({
	data,
	game,
	playtype,
}: {
	data: GoalSubDataset[0];
} & GamePT) {
	return (
		<td>
			<GentleLink to={`/dashboard/games/${game}/${playtype}/goals/${data.goalID}`}>
				{data.__related.goal.name}
			</GentleLink>
			{data.__related.parentQuests.length > 0 && (
				<>
					<br />
					Part of:
					{fmtQuests(data.__related.parentQuests)}
				</>
			)}
		</td>
	);
}

function fmtQuests(quests: Array<QuestDocument>) {
	const strs = [];

	for (let i = 0; i < Math.min(quests.length, 5); i++) {
		const quest = quests[i];

		strs.push(
			<GentleLink
				to={`/dashboard/games/${quest.game}/${quest.playtype}/quests/${quest.questID}`}
			>
				{quest.name}
			</GentleLink>
		);
	}

	if (quests.length > 5) {
		strs.push(<Muted>And {quests.length - 5} more...</Muted>);
	}

	return JoinJSX(strs, <>, </>);
}
