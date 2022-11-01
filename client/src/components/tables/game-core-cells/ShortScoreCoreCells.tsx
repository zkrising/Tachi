import IIDXLampCell from "components/tables/cells/IIDXLampCell";
import JubeatScoreCell from "components/tables/cells/JubeatScoreCell";
import LampCell from "components/tables/cells/LampCell";
import MillionsScoreCell from "components/tables/cells/MillionsScoreCell";
import PopnLampCell from "components/tables/cells/PopnLampCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import SDVXLampCell from "components/tables/cells/SDVXLampCell";
import React from "react";
import { ChartDocument, Game, PBScoreDocument, ScoreDocument } from "tachi-common";
import BMSOrPMSLampCell from "../cells/BMSOrPMSLampCell";
import BMSCoreCells from "./BMSCoreCells";

export default function ShortScoreCoreCells({
	game,
	score,
	chart,
}: {
	score: ScoreDocument | PBScoreDocument;
	chart: ChartDocument;
	game: Game;
}) {
	const sc = score as any; // lazy hack

	if (game === "iidx") {
		return (
			<>
				<ScoreCell score={sc} />
				<IIDXLampCell sc={sc} chart={chart as ChartDocument<"iidx:SP" | "iidx:DP">} />
			</>
		);
	} else if (game === "bms" || game === "pms") {
		return (
			<>
				<ScoreCell score={sc} />
				<BMSOrPMSLampCell score={sc} />
			</>
		);
	} else if (
		game === "sdvx" ||
		game === "usc" ||
		game === "museca" ||
		game === "wacca" ||
		game === "chunithm" ||
		game === "ddr" ||
		game === "gitadora"
	) {
		return (
			<>
				<MillionsScoreCell score={sc} />
				<SDVXLampCell score={sc} />
			</>
		);
	} else if (game === "maimai") {
		return (
			<>
				<ScoreCell score={sc} />
				<LampCell score={sc} />
			</>
		);
	} else if (game === "jubeat") {
		return (
			<>
				<JubeatScoreCell sc={sc} />
				<LampCell score={sc} />
			</>
		);
	} else if (game === "popn") {
		return (
			<>
				<MillionsScoreCell score={sc} />
				<PopnLampCell score={sc} />
			</>
		);
	} else if (game === "itg") {
		return (
			<>
				<ScoreCell showScore={false} score={sc} />
				<LampCell score={sc} />
			</>
		);
	}

	return <>No cells defined for {game}. Report this!</>;
}
