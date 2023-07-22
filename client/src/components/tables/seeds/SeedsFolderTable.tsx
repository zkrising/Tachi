import { FlattenValue, StringifyKeyChain } from "util/misc";
import { StrSOV } from "util/sorts";
import { SearchFunctions } from "util/ztable/search";
import Divider from "components/util/Divider";
import Muted from "components/util/Muted";
import React from "react";
import { Badge } from "react-bootstrap";
import { FolderDocument, FormatGame } from "tachi-common";
import { CellsRenderFN } from "types/seeds";
import { Header } from "../components/TachiTable";

export const SeedsFolderHeaders: Header<FolderDocument>[] = [
	["ID", "ID", StrSOV((x) => x.folderID)],
	["Name", "Name", StrSOV((x) => x.title)],
	["GPT", "GPT", StrSOV((x) => `${x.game} ${x.playtype}`)],
	["Query", "Query", StrSOV((x) => x.title)],
];

export const SeedsFolderSearchFns: SearchFunctions<FolderDocument> = {
	title: (x) => x.title,
	folderID: (x) => x.folderID,
	inactive: (x) => x.inactive,
	game: (x) => x.game,
	playtype: (x) => x.playtype,
	gpt: (x) => FormatGame(x.game, x.playtype),
	type: (x) => x.type,
	query: (x) =>
		FlattenValue(x.data)
			.map((e) => `${StringifyKeyChain(e.keychain)} ${e.value}`)
			.join("\n"),
};

export const SeedsFolderCells: CellsRenderFN<FolderDocument> = ({
	data,
}: {
	data: FolderDocument;
}) => (
	<>
		<td>
			<code>{data.folderID}</code>
		</td>
		<td>
			<strong>{data.title}</strong>
			{data.searchTerms && data.searchTerms.length !== 0 && (
				<>
					<br />
					<Muted>{data.searchTerms.join(", ")}</Muted>
				</>
			)}
			{data.inactive && (
				<>
					<br />
					<Badge variant="warning">INACTIVE</Badge>
				</>
			)}
		</td>
		<td>{FormatGame(data.game, data.playtype)}</td>
		<td>
			TYPE: <b>{data.type}</b>
			<Divider />
			<div className="text-start">
				{FlattenValue(data.data).map((e) => (
					<>
						{StringifyKeyChain(e.keychain)} = {String(e.value)}
						<br />
					</>
				))}
			</div>
		</td>
	</>
);
