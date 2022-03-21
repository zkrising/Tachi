import { integer, WebhookEventClassUpdateV1 } from "tachi-common";
import { BotConfig } from "../config";
import { client } from "../main";
import { GetUserInfo } from "../utils/apiRequests";
import { CreateEmbed } from "../utils/embeds";
import { PrependTachiUrl } from "../utils/fetchTachi";
import logger from "../utils/logger";
import { FormatClass, GetGameChannel } from "../utils/misc";

export async function HandleClassUpdateV1(
	event: WebhookEventClassUpdateV1["content"]
): Promise<integer> {
	const { game, playtype } = event;

	let channel;
	try {
		channel = GetGameChannel(client, game);
	} catch (e) {
		const err = e as Error;
		logger.error(`ClassUpdate handler failed: ${err.message}`);
		return 500;
	}

	const userDoc = await GetUserInfo(event.userID);

	const newClass = FormatClass(game, playtype, event.set, event.new);

	const embed = CreateEmbed()
		.setTitle(`${userDoc.username} just achieved ${newClass}.`)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`));

	if (event.old !== null) {
		embed.setDescription(`Raised from ${FormatClass(game, playtype, event.set, event.old)}`);
	}

	await channel.send({ embeds: [embed] });

	return 200;
}
