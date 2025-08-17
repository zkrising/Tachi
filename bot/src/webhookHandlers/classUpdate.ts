import { BotConfig } from "../config";
import { client } from "../main";
import { GetUGPTStats, GetUserInfo } from "../utils/apiRequests";
import { CreateEmbed } from "../utils/embeds";
import { PrependTachiUrl } from "../utils/fetchTachi";
import logger from "../utils/logger";
import { FormatClass, GetGameChannel } from "../utils/misc";
import { FormatGame, GetGamePTConfig } from "tachi-common";
import type {
	Classes,
	GPTString,
	Game,
	Playtype,
	WebhookEventClassUpdateV1,
	integer,
} from "tachi-common";

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

	if (!ShouldRenderUpdate(game, playtype, event.set, event.new)) {
		logger.info(
			`Not rendering class update ${event.set}: ${event.old} -> ${event.new} (not relevant).`
		);
		return 204;
	}

	const userDoc = await GetUserInfo(event.userID);

	const minimumNecessaryScores = GetMinimumScores(game, playtype, event.set);

	if (minimumNecessaryScores !== null) {
		const { totalScores } = await GetUGPTStats(userDoc.id, game, playtype);

		// Do not render if the user hasn't hit the score cap.
		if (totalScores < minimumNecessaryScores) {
			logger.info(
				`Not rendering class update ${event.set}: ${event.old} -> ${event.new} (not enough scores).`
			);
			return 204;
		}
	}

	const newClass = FormatClass(game, playtype, event.set, event.new);

	const embed = CreateEmbed()
		.setTitle(`${userDoc.username} just achieved ${newClass} in ${FormatGame(game, playtype)}!`)
		.setURL(
			`${BotConfig.TACHI_SERVER_LOCATION}/users/${userDoc.username}/games/${game}/${playtype}`
		)
		.setThumbnail(PrependTachiUrl(`/users/${userDoc.id}/pfp`));

	if (event.old !== null) {
		embed.setDescription(
			`(This was raised from ${FormatClass(game, playtype, event.set, event.old)}.)`
		);
	}

	await channel.send({ embeds: [embed] });

	return 200;
}

/**
 * Returns Whether this class update is notable enough to be rendered or not.
 */
function ShouldRenderUpdate(
	game: Game,
	playtype: Playtype,
	classSet: Classes[GPTString],
	classValue: string
) {
	const config = GetGamePTConfig(game, playtype);
	const classSpec = config.classes[classSet];

	if (classSpec === undefined) {
		logger.error(`Invalid class ${classSet} for ${game} ${playtype}`);
		return false;
	}

	if (classSpec.minimumRelevantValue === undefined) {
		return true;
	}

	const ids = classSpec.values.map((c) => c.id);

	const currentId = ids.indexOf(classValue);
	const minimumId = ids.indexOf(classSpec.minimumRelevantValue);

	if (currentId < 0) {
		logger.error(`Invalid classValue ${classValue} for ${game} ${playtype}`);
		return false;
	}

	if (minimumId < 0) {
		logger.error(`Invalid minimum classValue ${classValue} for ${game} ${playtype}`);
		return false;
	}

	return currentId >= minimumId;
}

function GetMinimumScores(
	game: Game,
	playtype: Playtype,
	classSet: Classes[GPTString]
): integer | null {
	const config = GetGamePTConfig(game, playtype);
	const classSpec = config.classes[classSet];

	if (classSpec === undefined) {
		logger.error(`Invalid class ${classSet} for ${game} ${playtype}`);
		return null;
	}

	return classSpec.minimumScores ?? null;
}
