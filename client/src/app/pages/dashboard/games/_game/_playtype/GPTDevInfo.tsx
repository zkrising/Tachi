import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import DebugContent from "components/util/DebugContent";
import React from "react";
import { GetGameConfig, FormatGame, GetGamePTConfig } from "tachi-common";
import { GamePT } from "types/react";

export default function GPTDevInfo({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Dev Info"],
		[game, playtype],
		`${FormatGame(game, playtype)} Dev Info`
	);

	const gameConfig = GetGameConfig(game);
	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<>
			<Card header="Game Configuration">
				<DebugContent data={gameConfig} />
			</Card>
			<Card className="mt-4" header="GPT Configuration">
				<DebugContent data={gptConfig} />
			</Card>
		</>
	);
}
