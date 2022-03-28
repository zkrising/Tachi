import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageSelectMenu, Util } from "discord.js";
import { Difficulties, FormatChart, IDStrings, integer, SongDocument } from "tachi-common";
import { GetGPTAndUser, ParseDifficulty } from "../../utils/argParsers";
import { CreateChartScoresEmbed } from "../../utils/embeds";
import { TachiServerV1Get } from "../../utils/fetchTachi";
import { GPTOptions, MakeRequired, OtherUserOption } from "../../utils/options";
import { ChartQueryReturns } from "../../utils/returnTypes";
import { SlashCommand } from "../types";

const command: SlashCommand = {
	info: new SlashCommandBuilder()
		.setName("chart")
		.setDescription("Retrieve info about a chart, including a users PB on it.")
		.addStringOption(MakeRequired(GPTOptions))
		.addStringOption((str) =>
			str
				.setName("song_name")
				.setDescription("The name of the song to fetch info on.")
				.setRequired(true)
		)
		.addStringOption((str) =>
			str
				.setName("difficulty")
				.setDescription("The difficulty of chart to return.")
				.setRequired(true)
		)
		.addStringOption(OtherUserOption)
		.toJSON(),
	exec: async (interaction, requestingUser) => {
		const gptUserInfo = await GetGPTAndUser(interaction, requestingUser);

		if (gptUserInfo.error !== null) {
			return gptUserInfo.error;
		}

		const { userDoc, game, playtype } = gptUserInfo.content;

		let difficulty: Difficulties[IDStrings] | null;

		try {
			difficulty = ParseDifficulty(
				game,
				playtype,
				interaction.options.getString("difficulty")
			);
		} catch (err) {
			return (err as Error).message;
		}

		let search = interaction.options.getString("song_name", true);

		// bms and pms don't deal with 'difficulties' the way you would expect
		// them to.
		// As such, we just treat a difficulty (if it exists) as being part of the
		// song title.
		if ((game === "bms" || game === "pms") && difficulty) {
			search += ` ${difficulty}`;
		}

		const chartsRes = await TachiServerV1Get<ChartQueryReturns>(
			`/games/${game}/${playtype}/charts`,
			requestingUser.tachiApiToken,
			{ search }
		);

		if (!chartsRes.success) {
			return `Failed to search charts for '${Util.escapeMarkdown(search)}'.`;
		}

		if (chartsRes.body.charts.length === 0) {
			return `Found no charts for the query '${Util.escapeMarkdown(search)}'.`;
		}

		if (difficulty) {
			chartsRes.body.charts = chartsRes.body.charts.filter(
				(e) => e.difficulty === difficulty
			);
		}

		// discord caps selects at 25 ... :(
		if (chartsRes.body.charts.length > 25) {
			chartsRes.body.charts = chartsRes.body.charts.slice(0, 25);
		}

		const firstChart = chartsRes.body.charts[0];

		const songMap = new Map<integer, SongDocument>();

		for (const song of chartsRes.body.songs) {
			songMap.set(song.id, song);
		}

		const firstSong = songMap.get(firstChart.songID);

		if (!firstSong) {
			throw new Error(`No firstSong for equivalent firstChart ${firstChart.chartID}?`);
		}

		const embed = await CreateChartScoresEmbed(userDoc, game, playtype, firstChart.chartID);

		// don't bother with showing a selector if the user gets it right.
		if (chartsRes.body.charts.length === 1) {
			return { embeds: [embed] };
		}

		const select = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId(`chart!${game}:${playtype}:${userDoc.id}`)
				.setPlaceholder("Select a different chart.")
				.addOptions(
					chartsRes.body.charts.map((chart) => ({
						label: FormatChart(game, songMap.get(chart.songID)!, chart),
						value: chart.chartID,
					}))
				)
		);

		return { embeds: [embed], components: [select] };
	},
};

export default command;
