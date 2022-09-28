import { FlattenValue, StringifyKeyChain } from "util/misc";
import { NumericSOV, StrSOV } from "util/sorts";
import { SearchFunctions } from "util/ztable/search";
import React from "react";
import { Game, SongDocument } from "tachi-common";
import { CellsRenderFN } from "types/seeds";
import ObjCell from "../cells/ObjCell";
import TitleCell from "../cells/TitleCell";
import { Header } from "../components/TachiTable";

export function MakeSeedsSongsControls(game: Game): {
	headers: Header<SongDocument>[];
	searchFns: SearchFunctions<SongDocument>;
	Cells: CellsRenderFN<SongDocument>;
} {
	return {
		headers: [
			["ID", "ID", NumericSOV((x) => x.id)],
			["Title", "Title", StrSOV((x) => x.title)],
			["Data", "Data"],
		],
		searchFns: {
			artist: (x) => x.artist,
			title: (x) => x.title,
			songID: (x) => x.id,
			searchTerms: (x) => x.searchTerms.join(", "),
			altTitles: (x) => x.altTitles.join(", "),
			data: (x) =>
				FlattenValue(x.data)
					.map((e) => `${StringifyKeyChain(e.keychain)} ${e.value}`)
					.join("\n"),
		},
		Cells: ({ data }) => (
			<>
				<td>{data.id}</td>
				<TitleCell game={game} song={data} showAltTitles showSearchTerms />
				<ObjCell data={data.data} />
			</>
		),
	};
}
