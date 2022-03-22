import { MessageEmbed } from "discord.js";
import {
	FormatChart,
	FormatGame,
	Game,
	GetGamePTConfig,
	ImportDocument,
	Playtype,
	PublicUserDocument,
} from "tachi-common";
import { BotConfig, ServerConfig } from "../config";
import { GetChartInfoForUser } from "./apiRequests";
import { PrependTachiUrl } from "./fetchTachi";
import {
	CreateChartLink,
	Entries,
	FormatDate,
	FormatProfileRating,
	FormatScoreRating,
	MillisToSince,
	Pluralise,
	UppercaseFirst,
} from "./misc";
import { UGPTStats } from "./returnTypes";

export function CreateEmbed() {
	return new MessageEmbed()
		.setColor(ServerConfig.type === "ktchi" ? "#e61c6e" : "#527acc")
		.setTimestamp();
}

export function CreateImportEmbed(importDoc: ImportDocument) {
	return CreateEmbed()
		.setTitle(
			`Imported ${importDoc.scoreIDs.length} ${Pluralise(
				importDoc.scoreIDs.length,
				"score"
			)}!`
		)
		.addField("Created Sessions", importDoc.createdSessions.length.toString(), true)
		.addField("Errors", importDoc.errors.length.toString(), true)
		.addField(
			"Your Profile",
			`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${importDoc.userID}/games/${importDoc.game}`
		);
}

export function CreateUserEmbed(userDoc: PublicUserDocument) {
	return CreateEmbed()
		.setTitle(`${userDoc.username} (#${userDoc.id})`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setDescription(userDoc.status ?? "No status...")
		.addField("Join Date", FormatDate(userDoc.joinDate))
		.setURL(`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${userDoc.username}`);
}

export function CreateGameProfileEmbed(userDoc: PublicUserDocument, ugptStats: UGPTStats) {
	const { game, playtype } = ugptStats.gameStats;

	const gptConfig = GetGamePTConfig(game, playtype);

	return CreateEmbed()
		.setTitle(`${userDoc.username} (${FormatGame(game, playtype)})`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setDescription(userDoc.status ?? "No status...")
		.addField(
			"Rankings",
			Entries(ugptStats.rankingData)
				.map(
					([k, v]) =>
						`**${k}**: #${v.ranking}/${v.outOf} (${FormatProfileRating(
							game,
							playtype,
							k,
							ugptStats.gameStats.ratings[k]
						)})`
				)
				.join("\n"),
			true
		)
		.addField(
			"Classes",
			Entries(ugptStats.gameStats.classes)
				.map(
					([k, v]) =>
						`**${UppercaseFirst(k)}**: ${gptConfig.classHumanisedFormat[k][v].display}`
				)
				.join("\n"),
			true
		)
		.addField("Playcount", ugptStats.totalScores.toString())
		.addField(
			"First Play",
			ugptStats.firstScore.timeAchieved
				? `${FormatDate(ugptStats.firstScore.timeAchieved)}
(${MillisToSince(ugptStats.firstScore.timeAchieved)})`
				: "N/A",
			true
		)
		.addField(
			"Last Played",
			ugptStats.mostRecentScore.timeAchieved
				? `${FormatDate(ugptStats.mostRecentScore.timeAchieved)}
(${MillisToSince(ugptStats.mostRecentScore.timeAchieved)})`
				: "N/A",
			true
		)
		.setURL(
			`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${userDoc.username}/games/${game}/${playtype}`
		);
}

export async function CreateChartScoresEmbed(
	userDoc: PublicUserDocument,
	game: Game,
	playtype: Playtype,
	chartID: string
) {
	const { song, chart, pb } = await GetChartInfoForUser(userDoc.id, chartID, game, playtype);

	const embed = CreateEmbed()
		.setTitle(`${userDoc.username}: ${FormatChart(game, song, chart)}`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setURL(CreateChartLink(chart, game));

	if (pb === null) {
		embed.setDescription("You have not played this chart.");
	} else {
		embed
			.addField(
				"Score",
				`${pb.scoreData.score} (${pb.scoreData.grade}, ${pb.scoreData.percent.toFixed(
					2
				)}%)`,
				true
			)
			.addField("Lamp", pb.scoreData.lamp, true)
			.addField(
				"Ratings",
				Entries(pb.calculatedData)
					.map(
						([key, value]) =>
							`${UppercaseFirst(key)}: ${FormatScoreRating(
								game,
								playtype,
								key,
								value
							)}`
					)
					.join("\n")
			)
			.addField(
				"Last Raised",
				pb.timeAchieved
					? `${FormatDate(pb.timeAchieved)} (${MillisToSince(pb.timeAchieved)})`
					: "N/A",
				true
			)
			.addField("Ranking", `#**${pb.rankingData.rank}**/${pb.rankingData.outOf}`);
	}

	return embed;
}
