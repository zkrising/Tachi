import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";
import { FormatGame, GetGameConfig, PublicUserDocument } from "tachi-common";
import { GamePT } from "types/react";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function FoldersPage({ reqUser, game, playtype }: Props) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Achievables"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Goals & Milestones`
	);

	return <div></div>;
}
