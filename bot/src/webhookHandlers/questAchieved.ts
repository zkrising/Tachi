import { client } from "../main";
import { GetQuestWithID, GetUserInfo } from "../utils/apiRequests";
import { CreateEmbed } from "../utils/embeds";
import logger from "../utils/logger";
import { GetGameChannel } from "../utils/misc";
import { GetGameConfig } from "tachi-common";
import type { integer, WebhookEventQuestAchievedV1 } from "tachi-common";

export async function HandleQuestAchievedV1(
	event: WebhookEventQuestAchievedV1["content"]
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

	const quest = await GetQuestWithID(event.questID, game, playtype);

	const gameConfig = GetGameConfig(game);
	const shouldShowPlaytype = gameConfig.playtypes.length > 1 ? ` (${playtype})` : "";

	const embed = CreateEmbed(userDoc.id).setTitle(
		`${userDoc.username} just completed the ${quest.name}${shouldShowPlaytype} quest!`
	);

	await channel.send({ embeds: [embed] });

	return 200;
}
