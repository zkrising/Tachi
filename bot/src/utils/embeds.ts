import { MessageEmbed } from "discord.js";
import { FormatGame, GetGamePTConfig, ImportDocument, PublicUserDocument } from "tachi-common";
import { BotConfig, ServerConfig } from "../config";
import { PrependTachiUrl } from "./fetchTachi";
import {
	Entries,
	FormatDate,
	FormatProfileRating,
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
