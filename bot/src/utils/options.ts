import { ServerConfig } from "../config";
import { FormatGame, GetGameConfig } from "tachi-common";
import type { SlashCommandStringOption } from "@discordjs/builders";

/**
 * Game Playtype options. Frequently used by things that might need
 * game specific listening.
 */
const GPTChoices: Array<[string, string]> = [];

for (const game of ServerConfig.games) {
	const gameConfig = GetGameConfig(game);

	for (const playtype of gameConfig.playtypes) {
		GPTChoices.push([FormatGame(game, playtype), `${game}:${playtype}`]);
	}
}

export const GPTOptions = (str: SlashCommandStringOption) =>
	str.setName("game").setDescription("Pick the relevant game.").addChoices(GPTChoices);

export function MakeRequired(fn: (str: SlashCommandStringOption) => SlashCommandStringOption) {
	return (str: SlashCommandStringOption) => fn(str).setRequired(true);
}

export const OtherUserOption = (str: SlashCommandStringOption) =>
	str.setName("other_user").setDescription("Optionally, check this info out for another user.");
