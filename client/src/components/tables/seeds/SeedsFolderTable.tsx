import { FlattenValue, StringifyKeyChain } from "util/misc";
import { StrSOV } from "util/sorts";
import DebugContent from "components/util/DebugContent";
import Muted from "components/util/Muted";
import React from "react";
import { Badge } from "react-bootstrap";
import { FolderDocument, FormatGame } from "tachi-common";
import Divider from "components/util/Divider";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";

export default function SeedsFolderTable({ dataset }: { dataset: FolderDocument[] }) {
	const headers: Header<FolderDocument>[] = [
		["ID", "ID", StrSOV((x) => x.folderID)],
		["Name", "Name", StrSOV((x) => x.title)],
		["GPT", "GPT", StrSOV((x) => `${x.game} ${x.playtype}`)],
		["Query", "Query", StrSOV((x) => x.title)],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Folders"
			searchFunctions={{
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
			}}
			rowFunction={(x) => <Row data={x} />}
		/>
	);
}

function Row({ data }: { data: FolderDocument }) {
	return (
		<DropdownRow dropdown={<DebugContent data={{ ...data, __related: undefined }} />}>
			<td>
				<code>{data.folderID}</code>
			</td>
			<td>
				<strong>{data.title}</strong>
				{data.searchTerms.length !== 0 && (
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
				<div className="text-left">
					{FlattenValue(data.data).map((e) => (
						<>
							{StringifyKeyChain(e.keychain)} = {String(e.value)}
							<br />
						</>
					))}
				</div>
			</td>
		</DropdownRow>
	);
}
