import { StrSOV } from "util/sorts";
import { SearchFunctions } from "util/ztable/search";
import { InnerQuestSectionGoal } from "components/targets/quests/Quest";
import Muted from "components/util/Muted";
import React from "react";
import { FormatGame } from "tachi-common";
import { CellsRenderFN, QuestWithRelated } from "types/seeds";
import { Header } from "../components/TachiTable";

export const SeedsQuestsHeaders: Header<QuestWithRelated>[] = [
	["ID", "ID", StrSOV((x) => x.questID)],
	["Name", "Name", StrSOV((x) => x.name)],
	["GPT", "GPT", StrSOV((x) => `${x.game} ${x.playtype}`)],
	["Goals", "Goals"],
];

export const SeedsQuestSearchFns: SearchFunctions<QuestWithRelated> = {
	name: (x) => x.name,
	questID: (x) => x.questID,
	game: (x) => x.game,
	playtype: (x) => x.playtype,
	gpt: (x) => FormatGame(x.game, x.playtype),
	goals: (x) =>
		Object.values(x.__related.goals)
			.map((e) => e!.name)
			.join(" "),
};

export const SeedsQuestCells: CellsRenderFN<QuestWithRelated> = ({
	data,
}: {
	data: QuestWithRelated;
}) => (
	<>
		<td>
			<code>{data.questID}</code>
		</td>
		<td>
			<strong>{data.name}</strong>
		</td>
		<td>{FormatGame(data.game, data.playtype)}</td>
		<td>
			<div style={{ maxHeight: "200px", overflowY: "auto" }}>
				{data.questData.map((section) => (
					<>
						<h6>{section.title}</h6>
						{section.desc && <Muted>{section.desc}</Muted>}
						{section.goals.map((ref) => {
							const goal = data.__related.goals[ref.goalID];

							if (goal) {
								return (
									<div className="text-left">
										<InnerQuestSectionGoal goal={goal} />
										{ref.note && <Muted>{ref.note}</Muted>}
									</div>
								);
							}

							return (
								<>
									<div>UNKNOWN GOAL: {ref.goalID}</div>
								</>
							);
						})}
					</>
				))}
			</div>
		</td>
	</>
);
