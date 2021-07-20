import React, { useState } from "react";
import {
	Game,
	GetGamePTConfig,
	IDStrings,
	integer,
	SessionCalculatedDataLookup,
	SessionDocument,
	SessionScoreInfo,
} from "tachi-common";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { FormatDuration, FormatTime, MillisToSince } from "util/time";
import IndexCell from "../cells/IndexCell";
import TachiTable, { Header } from "../components/TachiTable";

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
				duration: x => x.timeEnded - x.timeStarted,
				timestamp: x => x.timeStarted,
			}}
			rowFunction={s => (
				<tr key={s.sessionID}>
					{indexCol && <IndexCell index={s.__related.index} />}
					<td style={{ minWidth: "140px" }}>
						{s.name}
						<br />
						<small className="text-muted">{s.desc}</small>
					</td>
					<td>
						{s.scoreInfo.length}
						<br />
						<small className="text-muted">PBs: {GetPBs(s.scoreInfo).length}</small>
					</td>
					<td>
						{s.calculatedData[rating]
							? s.calculatedData[rating]?.toFixed(2)
							: "No Data."}
					</td>
					<td>{FormatDuration(s.timeEnded - s.timeStarted)}</td>
					<td>
						{MillisToSince(s.timeStarted)}
						<br />
						<small className="text-muted">{FormatTime(s.timeStarted)}</small>
					</td>
				</tr>
			)}
		/>
	);
}

function GetPBs(scoreInfo: SessionScoreInfo[]) {
	return scoreInfo.map(e => e.isNewScore === true || e.lampDelta > 0 || e.scoreDelta > 0);
}
