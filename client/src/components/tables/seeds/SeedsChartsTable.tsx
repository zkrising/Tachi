import { ChangeOpacity } from "util/color-opacity";
import { FlattenValue, StringifyKeyChain } from "util/misc";
import { StrSOV } from "util/sorts";
import { SearchFunctions } from "util/ztable/search";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import React from "react";
import { COLOUR_SET, Game } from "tachi-common";
import { CellsRenderFN, ChartWithRelated } from "types/seeds";
import DifficultyCell from "../cells/DifficultyCell";
import ObjCell from "../cells/ObjCell";
import TitleCell from "../cells/TitleCell";
import ChartHeader from "../headers/ChartHeader";
import { Header } from "../components/TachiTable";

export function MakeSeedsChartsControls(game: Game): {
	headers: Header<ChartWithRelated>[];
	searchFns: SearchFunctions<ChartWithRelated>;
	Cells: CellsRenderFN<ChartWithRelated>;
} {
	return {
		headers: [
			ChartHeader(game, (k) => k),
			["Title", "Title", StrSOV((x) => x.__related.song?.title ?? "")],
			["Data", "Data"],
		],
		searchFns: {
			artist: (x) => x.__related.song?.artist ?? null,
			title: (x) => x.__related.song?.title ?? null,
			songID: (x) => x.__related.song?.id ?? null,
			searchTerms: (x) => x.__related.song?.searchTerms.join(", ") ?? null,
			altTitles: (x) => x.__related.song?.altTitles.join(", ") ?? null,
			difficulty: (x) => x.difficulty,
			level: (x) => x.levelNum,
			data: (x) =>
				FlattenValue(x.data)
					.map((e) => `${StringifyKeyChain(e.keychain)} ${e.value}`)
					.join("\n"),
		},
		Cells: ({ data }) => (
			<>
				<DifficultyCell chart={data} game={game} />

				{/* if we have a song, render the title cell. Otherwise, this chart has no parent song, and is invalid. */}
				{data.__related.song ? (
					<TitleCell game={game} song={data.__related.song} chart={data} />
				) : (
					<td style={{ backgroundColor: ChangeOpacity(COLOUR_SET.red, 0.3) }}>
						INVALID SONG ({data.songID})
						<QuickTooltip tooltipContent="This chart points to a songID that does not exist at the time of this commit. This is a fatal error, and this commit doesn't pass tests.">
							<div>
								<Icon type="info" />
							</div>
						</QuickTooltip>
					</td>
				)}

				<ObjCell data={data.data} />
			</>
		),
	};
}
