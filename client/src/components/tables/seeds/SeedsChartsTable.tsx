import { ChangeOpacity } from "util/color-opacity";
import { FlattenValue, StringifyKeyChain } from "util/misc";
import { StrSOV } from "util/sorts";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import DebugContent from "components/util/DebugContent";
import Icon from "components/util/Icon";
import React from "react";
import { COLOUR_SET, Game } from "tachi-common";
import { ChartWithRelated } from "types/seeds";
import DifficultyCell from "../cells/DifficultyCell";
import ObjCell from "../cells/ObjCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import ChartHeader from "../headers/ChartHeader";

export default function SeedsChartsTable({
	dataset,
	game,
}: {
	dataset: ChartWithRelated[];
	game: Game;
}) {
	const headers: Header<ChartWithRelated>[] = [
		ChartHeader(game, (k) => k),
		["Title", "Title", StrSOV((x) => x.__related.song?.title ?? "")],
		["Data", "Data"],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Charts"
			searchFunctions={{
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
			}}
			rowFunction={(x) => <Row data={x} game={game} />}
		/>
	);
}

function Row({ data, game }: { data: ChartWithRelated; game: Game }) {
	return (
		<DropdownRow dropdown={<DebugContent data={{ ...data, __related: undefined }} />}>
			<DifficultyCell chart={data} game={game} />

			{/* if we have a song, render the title cell. Otherwise, this chart has no parent song, and is invalid. */}
			{data.__related.song ? (
				<TitleCell game={game} song={data.__related.song} chart={data} />
			) : (
				<td style={{ backgroundColor: ChangeOpacity(COLOUR_SET.red, 0.3) }}>
					INVALID SONG ({data.songID}
					<QuickTooltip tooltipContent="This chart points to a songID that does not exist at the time of this commit. This is a fatal error, and this commit doesn't pass tests.">
						<div>
							<Icon type="info" />
						</div>
					</QuickTooltip>
				</td>
			)}

			<ObjCell data={data.data} />
		</DropdownRow>
	);
}
