import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import {
	Game,
	GetGamePTConfig,
	IDStrings,
	integer,
	ScoreCalculatedDataLookup,
	ScoreDocument,
} from "tachi-common";
import { Playtype } from "types/tachi";
import { NumericSOV } from "util/sorts";
import TimestampCell from "../cells/TimestampCell";
import SelectableRating from "../components/SelectableRating";
import TachiTable, { ZTableTHProps } from "../components/TachiTable";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";

export default function HistoryScoreTable({
	dataset,
	pageLen = 5,
	playtype,
	game,
}: {
	dataset: ScoreDocument[];
	pageLen?: integer;
	playtype: Playtype;
	game: Game;
}) {
	const defaultRating = useScoreRatingAlg(game, playtype);

	const [rating, setRating] = useState(defaultRating);

	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			noTopDisplayStr
			entryName="Scores"
			headers={[
				["Score", "Score", NumericSOV(x => x.scoreData.percent)],
				["Info", "Info", NumericSOV(x => x.scoreData.percent)],
				["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
				game === "iidx"
					? [
							"Rating",
							"Rating",
							NumericSOV(x => x.calculatedData[rating] ?? 0),
							(thProps: ZTableTHProps) => (
								<SelectableRating
									key={nanoid()}
									game="iidx"
									playtype={playtype}
									rating={rating}
									setRating={setRating}
									{...thProps}
								/>
							),
					  ]
					: ["Rating", "Rating", NumericSOV(x => x.calculatedData[rating] ?? 0)],
				["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
			]}
			defaultSortMode="Timestamp"
			defaultReverseSort
			rowFunction={sc => <Row key={sc.scoreID} sc={sc} game={game} rating={rating} />}
		/>
	);
}

function Row({
	sc,
	rating,
	game,
}: {
	sc: ScoreDocument;
	rating: ScoreCalculatedDataLookup[IDStrings];
	game: Game;
}) {
	return (
		<tr>
			<ScoreCoreCells score={sc} game={game} rating={rating as any} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</tr>
	);
}
