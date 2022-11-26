import { FlattenValue, StringifyKeyChain } from "util/misc";
import { StrSOV } from "util/sorts";
import { SearchFunctions } from "util/ztable/search";
import Muted from "components/util/Muted";
import React from "react";
import { FormatGame, GoalDocument } from "tachi-common";
import { CellsRenderFN } from "types/seeds";
import { Header } from "../components/TachiTable";

export const SeedsGoalsHeaders: Header<GoalDocument>[] = [
	["ID", "ID", StrSOV((x) => x.goalID)],
	["Name", "Name", StrSOV((x) => x.name)],
	["GPT", "GPT", StrSOV((x) => `${x.game} ${x.playtype}`)],
	["Charts", "Charts"],
	["Criteria", "Criteria"],
];

export const SeedsGoalSearchFns: SearchFunctions<GoalDocument> = {
	name: (x) => x.name,
	goalID: (x) => x.goalID,
	game: (x) => x.game,
	playtype: (x) => x.playtype,
	gpt: (x) => FormatGame(x.game, x.playtype),
	type: (x) => x.charts.type,
	charts: (x) =>
		FlattenValue(x.charts)
			.map((e) => `${StringifyKeyChain(e.keychain)} ${e.value}`)
			.join("\n"),
	criteria: (x) =>
		FlattenValue(x.criteria)
			.map((e) => `${StringifyKeyChain(e.keychain)} ${e.value}`)
			.join("\n"),
};

export const SeedsGoalCells: CellsRenderFN<GoalDocument> = ({ data }: { data: GoalDocument }) => (
	<>
		<td>
			<code>{data.goalID}</code>
		</td>
		<td>
			<strong>{data.name}</strong>
		</td>
		<td>{FormatGame(data.game, data.playtype)}</td>
		<td>
			<div className="text-left">
				{FlattenValue(data.charts).map((e) => (
					<>
						{StringifyKeyChain(e.keychain)} = {String(e.value)}
						<br />
					</>
				))}
			</div>
		</td>
		<td>
			<div className="text-left">
				{FlattenValue(data.criteria).map((e) => (
					<>
						{StringifyKeyChain(e.keychain)} = {String(e.value)}
						<br />
					</>
				))}
			</div>
		</td>
	</>
);
