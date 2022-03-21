import { SlashCommandStringOption } from "@discordjs/builders";
import { FormatGame, GetGameConfig } from "tachi-common";
import { ServerConfig } from "../config";

/**
 * Game Playtype options. Frequently used by things that might need
 * game specific listening.
 */
const GPTChoices: [string, string][] = [];

for (const game of ServerConfig.games) {
	const gameConfig = GetGameConfig(game);

	for (const playtype of gameConfig.validPlaytypes) {
		GPTChoices.push([FormatGame(game, playtype), `${game}:${playtype}`]);
	}
}

export const GPTOptions = (str: SlashCommandStringOption) =>
	str.setName("game").setDescription("Pick the relevant game.").addChoices(GPTChoices);

export function MakeRequired(fn: (str: SlashCommandStringOption) => SlashCommandStringOption) {
	return (str: SlashCommandStringOption) => fn(str).setRequired(true);
}
