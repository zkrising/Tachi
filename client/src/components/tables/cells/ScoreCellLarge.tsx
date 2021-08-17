import React from "react";
import { Playtype } from "types/tachi";
import { FormatMillions } from "util/misc";
import ScoreCell from "./ScoreCell";
import { Game, ScoreDocument, PBScoreDocument } from "tachi-common";

export default function ScoreCellLarge(props: {
	game: Game;
	playtype: Playtype;
	score: ScoreDocument | PBScoreDocument;
}) {
	return <ScoreCell {...props} scoreRenderFn={FormatMillions} />;
}
