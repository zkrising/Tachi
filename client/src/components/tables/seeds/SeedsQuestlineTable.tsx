import { StrSOV } from "util/sorts";
import { SearchFunctions } from "util/ztable/search";
import Muted from "components/util/Muted";
import React from "react";
import { FormatGame } from "tachi-common";
import { CellsRenderFN, QuestlineWithRelated } from "types/seeds";
import { Header } from "../components/TachiTable";

export const SeedsQuestlineHeaders: Header<QuestlineWithRelated>[] = [
	["ID", "ID", StrSOV((x) => x.questlineID)],
	["Name", "Name", StrSOV((x) => x.name)],
	["GPT", "GPT", StrSOV((x) => `${x.game} ${x.playtype}`)],
	["Quests", "Quests"],
];

export const SeedsQuestlineSearchFns: SearchFunctions<QuestlineWithRelated> = {
	name: (x) => x.name,
	questlineID: (x) => x.questlineID,
	desc: (x) => x.desc,
	game: (x) => x.game,
	playtype: (x) => x.playtype,
	gpt: (x) => FormatGame(x.game, x.playtype),
	quests: (x) =>
		Object.values(x.__related.quests)
			.filter((e) => e !== undefined)
			.map((e) => e!.name)
			.join("\n"),
};

export const SeedsQuestlineCells: CellsRenderFN<QuestlineWithRelated> = ({ data }) => (
	<>
		<td>
			<code>{data.questlineID}</code>
		</td>
		<td>
			<strong>{data.name}</strong>
			<br />
			<Muted>{data.desc}</Muted>
		</td>
		<td>{FormatGame(data.game, data.playtype)}</td>
		<td className="text-start">
			<div style={{ maxHeight: "200px", overflowY: "auto" }}>
				{data.quests.map((e) => {
					const quest = data.__related.quests[e];

					return (
						<div key={e}>
							{quest ? (
								<span>
									{quest.name} ({quest.playtype})
								</span>
							) : (
								<span className="text-danger">UNKNOWN QUEST {e}</span>
							)}
						</div>
					);
				})}
			</div>
		</td>
	</>
);
