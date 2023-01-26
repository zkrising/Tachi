import { PrependTachiUrl } from "./fetchTachi";
import { FormatDate, Pluralise } from "./misc";
import { BotConfig, ServerConfig } from "../config";
import { MessageEmbed } from "discord.js";
import type { ImportDocument, UserDocument, integer } from "tachi-common";

export function CreateEmbed(userID?: integer) {
	const embed = new MessageEmbed()
		.setColor(ServerConfig.type === "ktchi" ? "#e61c6e" : "#527acc")
		.setTimestamp();

	if (userID !== undefined) {
		embed.setThumbnail(PrependTachiUrl(`/users/${userID}/pfp`));
	}

	return embed;
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
			`${BotConfig.TACHI_SERVER_LOCATION}/u/${importDoc.userID}/games/${importDoc.game}`
		);
}

export function CreateUserEmbed(userDoc: UserDocument) {
	return CreateEmbed()
		.setTitle(`${userDoc.username} (ID: ${userDoc.id})`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`))
		.setDescription(userDoc.status ?? "No status...")
		.addField("Join Date", FormatDate(userDoc.joinDate))
		.setURL(`${BotConfig.TACHI_SERVER_LOCATION}/u/${userDoc.username}`);
}
