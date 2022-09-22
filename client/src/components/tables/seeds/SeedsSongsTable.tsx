import { NumericSOV, StrSOV } from "util/sorts";
import { FlattenValue, StringifyKeyChain } from "util/misc";
import React from "react";
import { Game, SongDocument } from "tachi-common";
import DebugContent from "components/util/DebugContent";
import TachiTable, { Header } from "../components/TachiTable";
import DropdownRow from "../components/DropdownRow";
import TitleCell from "../cells/TitleCell";
import ObjCell from "../cells/ObjCell";

export default function SeedsSongsTable({
	dataset,
	game,
}: {
	dataset: SongDocument[];
	game: Game;
}) {
	const headers: Header<SongDocument>[] = [
		["ID", "ID", NumericSOV((x) => x.id)],
		["Title", "Title", StrSOV((x) => x.title)],
		["Data", "Data"],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Songs"
			searchFunctions={{
				artist: (x) => x.artist,
				title: (x) => x.title,
				songID: (x) => x.id,
				searchTerms: (x) => x.searchTerms.join(", "),
				altTitles: (x) => x.altTitles.join(", "),
				data: (x) =>
					FlattenValue(x.data)
						.map((e) => `${StringifyKeyChain(e.keychain)} ${e.value}`)
						.join("\n"),
			}}
			rowFunction={(x) => <Row data={x} game={game} />}
		/>
	);
}

function Row({ data, game }: { data: SongDocument; game: Game }) {
	return (
		<DropdownRow dropdown={<DebugContent data={{ ...data, __related: undefined }} />}>
			<td>{data.id}</td>
			<TitleCell game={game} song={data} showAltTitles showSearchTerms />
			<ObjCell data={data.data} />
		</DropdownRow>
	);
}
