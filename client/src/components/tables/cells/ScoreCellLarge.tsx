import { FormatMillions } from "util/misc";
import React from "react";
import { Game, PBScoreDocument, ScoreDocument } from "tachi-common";
import { Playtype } from "types/tachi";
import ScoreCell from "./ScoreCell";

export default function ScoreCellLarge(props: {
	game: Game;
	playtype: Playtype;
	score: ScoreDocument | PBScoreDocument;
}) {
	return <ScoreCell {...props} scoreRenderFn={FormatMillions} />;
}
