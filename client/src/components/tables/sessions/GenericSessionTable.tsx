import React, { useState } from "react";
import {
	Game,
	GetGamePTConfig,
	IDStrings,
	integer,
	PublicUserDocument,
	ScoreCalculatedDataLookup,
	SessionCalculatedDataLookup,
	SessionDocument,
} from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { GetPBs } from "util/data";
import { NumericSOV, StrSOV } from "util/sorts";
import { FormatDuration, FormatTime, MillisToSince } from "util/time";
import IndexCell from "../cells/IndexCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import GenericSessionDropdown from "../dropdowns/GenericSessionDropdown";
import IIDXScoreDropdown from "../dropdowns/IIDXScoreDropdown";

export type SessionDataset = (SessionDocument & { __related: { index: integer } })[];

export default function GenericSessionTable({
	dataset,
	indexCol = false,
	game,
	playtype,
}: {
	dataset: SessionDataset;
	indexCol?: boolean;
	game: Game;
	playtype: Playtype;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [rating, setRating] = useState<SessionCalculatedDataLookup[IDStrings]>(
		gptConfig.defaultSessionRatingAlg
	);

	const headers: Header<SessionDataset[0]>[] = [
		["Name", "Name", StrSOV(x => x.name)],
		["Scores", "Scores", NumericSOV(x => x.scoreInfo.length)],
		[rating, rating, NumericSOV(x => x.calculatedData[rating] ?? 0)],
		["Duration", "Dur.", NumericSOV(x => x.timeEnded - x.timeStarted)],
		["Timestamp", "Timestamp", NumericSOV(x => x.timeStarted)],
	];

	if (indexCol) {
		headers.unshift(["#", "#", NumericSOV(x => x.__related.index)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Sessions"
			searchFunctions={{
				name: x => x.name,
				scores: x => x.scoreInfo.length,
				pbs: x => GetPBs(x.scoreInfo).length,
				pbRate: x => GetPBs(x.scoreInfo).length / x.scoreInfo.length,
				duration: x => (x.timeEnded - x.timeStarted) / (1000 * 60),
				timestamp: x => x.timeStarted,
			}}
			rowFunction={s => (
				<Row data={s} key={s.sessionID} rating={rating} indexCol={indexCol} />
			)}
		/>
	);
}

function Row({
	data,
	rating,
	indexCol = false,
}: // reqUser,
{
	data: SessionDataset[0];
	// reqUser: PublicUserDocument;
	rating: SessionCalculatedDataLookup[IDStrings];
	indexCol?: boolean;
}) {
	const [highlight, setHighlight] = useState(data.highlight);
	const [desc, setDesc] = useState(data.desc);

	const sessionState = { highlight, desc, setHighlight, setDesc };

	return (
		<DropdownRow
			className={highlight ? "highlighted-row" : ""}
			dropdown={<GenericSessionDropdown data={data} />}
		>
			{indexCol && <IndexCell index={data.__related.index} />}
			<td style={{ minWidth: "140px" }}>
				{data.name}
				<br />
				<small className="text-muted">{desc}</small>
			</td>
			<td>
				{data.scoreInfo.length}
				<br />
				<small className="text-muted">PBs: {GetPBs(data.scoreInfo).length}</small>
			</td>
			<td>
				{data.calculatedData[rating] ? data.calculatedData[rating]?.toFixed(2) : "No Data."}
			</td>
			<td>{FormatDuration(data.timeEnded - data.timeStarted)}</td>
			<td>
				{MillisToSince(data.timeStarted)}
				<br />
				<small className="text-muted">{FormatTime(data.timeStarted)}</small>
			</td>
		</DropdownRow>
	);
}
