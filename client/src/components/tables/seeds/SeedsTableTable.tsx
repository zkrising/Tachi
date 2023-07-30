import { StrSOV } from "util/sorts";
import { SearchFunctions } from "util/ztable/search";
import Muted from "components/util/Muted";
import React from "react";
import { Badge } from "react-bootstrap";
import { FormatGame } from "tachi-common";
import { CellsRenderFN, TableWithRelated } from "types/seeds";
import { Header } from "../components/TachiTable";

export const SeedsTableHeaders: Header<TableWithRelated>[] = [
	["ID", "ID", StrSOV((x) => x.tableID)],
	["Name", "Name", StrSOV((x) => x.title)],
	["GPT", "GPT", StrSOV((x) => `${x.game} ${x.playtype}`)],
	["Folders", "Folders", StrSOV((x) => x.title)],
];

export const SeedsTableSearchFns: SearchFunctions<TableWithRelated> = {
	title: (x) => x.title,
	tableID: (x) => x.tableID,
	inactive: (x) => x.inactive,
	default: (x) => x.default,
	description: (x) => x.description,
	game: (x) => x.game,
	playtype: (x) => x.playtype,
	gpt: (x) => FormatGame(x.game, x.playtype),
	folder: (x) =>
		Object.values(x.__related.folders)
			.filter((e) => e !== undefined)
			.map((e) => e!.title)
			.join("\n"),
};

export const SeedsTableCells: CellsRenderFN<TableWithRelated> = ({ data }) => (
	<>
		<td>
			<code>{data.tableID}</code>
		</td>
		<td>
			<strong>{data.title}</strong>
			<br />
			<Muted>{data.description}</Muted>
			{(data.inactive || data.default) && <br />}
			{data.default && <Badge bg="success">DEFAULT</Badge>}
			{data.inactive && <Badge bg="warning">INACTIVE</Badge>}
		</td>
		<td>{FormatGame(data.game, data.playtype)}</td>
		<td className="text-start">
			<div style={{ maxHeight: "200px", overflowY: "auto" }}>
				{data.folders.map((e) => {
					const folder = data.__related.folders[e];

					return (
						<div key={e}>
							{folder ? (
								<span>
									{folder.title} ({folder.playtype})
								</span>
							) : (
								<span className="text-danger">UNKNOWN FOLDER {e}</span>
							)}
						</div>
					);
				})}
			</div>
		</td>
	</>
);
