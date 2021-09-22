import useSetSubheader from "components/layout/header/useSetSubheader";
import LinkButton from "components/util/LinkButton";
import React, { useEffect } from "react";
import { Button, Row } from "react-bootstrap";
import { ChartDocument, FormatDifficulty, GetGameConfig, GetGamePTConfig } from "tachi-common";
import { SongsReturn } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { ChangeOpacity } from "util/color-opacity";
import { NumericSOV } from "util/sorts";

export default function GPTSongPage({
	game,
	playtype,
	song,
	charts,
	setActiveChart,
}: { setActiveChart: SetState<ChartDocument | null> } & SongsReturn & GamePT) {
	const formatSongTitle = `${song.artist} - ${song.title}`;

	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Songs", formatSongTitle],
		[game, playtype],
		formatSongTitle
	);

	setActiveChart(null);

	return <div className="w-100 text-center">You gotta select a chart to see leaderboards!</div>;
}
