import { BotConfig } from "../config";
import { client } from "../main";
import { GetUGPTStats, GetUserInfo } from "../utils/apiRequests";
import { CreateEmbed } from "../utils/embeds";
import { PrependTachiUrl } from "../utils/fetchTachi";
import logger from "../utils/logger";
import { FormatClass, GetGameChannel } from "../utils/misc";
import { FormatGame, POPN_CLASSES, SDVX_VF_CLASSES } from "tachi-common";
import type { Game, integer, Playtype, WebhookEventClassUpdateV1 } from "tachi-common";
import type { AllClassSets } from "tachi-common/game-classes";

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
		return 204;
	}

	const userDoc = await GetUserInfo(event.userID);

	// We don't want to render classes if the user is blitzing through them
	// because they haven't played enough charts to "average out".
	// For example, a new player playing their first 50 charts will blitz through
	// atleast 10 of the volforce ranks, which will just result in channel spam.
	const minimumNecessaryScores = GetMinimumScores(game, playtype, event.set);

	if (minimumNecessaryScores !== null) {
		const { totalScores } = await GetUGPTStats(userDoc.id, game, playtype);

		// Do not render if the user hasn't hit the score cap.
		if (totalScores < minimumNecessaryScores) {
			logger.info(`Not rendering class update ${event.set}: ${event.old} -> ${event.new}.`);
			return 204;
		}
	}

	const newClass = FormatClass(game, playtype, event.set, event.new);

	const embed = CreateEmbed()
		.setTitle(`${userDoc.username} just achieved ${newClass} in ${FormatGame(game, playtype)}!`)
		.setURL(
			`${BotConfig.TACHI_SERVER_LOCATION}/dashboard/users/${userDoc.username}/games/${game}/${playtype}`
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
	classSet: AllClassSets,
	classValue: integer
) {
	if (game === "sdvx" && classSet === "vfClass") {
		return [
			SDVX_VF_CLASSES.IMPERIAL_I,
			SDVX_VF_CLASSES.IMPERIAL_II,
			SDVX_VF_CLASSES.IMPERIAL_III,
			SDVX_VF_CLASSES.IMPERIAL_IV,
		].includes(classValue);
	} else if (game === "popn" && classSet === "class") {
		return [
			// All of the other classes in pop'n can be trivially blitzed through.
			POPN_CLASSES.GOD,
		].includes(classValue);
	}

	return true;
}

function GetMinimumScores(game: Game, playtype: Playtype, classSet: AllClassSets): integer | null {
	if (game === "chunithm") {
		return 20;
	} else if (game === "sdvx" && classSet === "vfClass") {
		return 50;
	} else if (game === "gitadora") {
		return 50;
	} else if (game === "jubeat") {
		return 60;
	} else if (game === "wacca") {
		return 50;
	} else if (game === "bms") {
		return 20;
	} else if (game === "iidx") {
		return 20;
	} else if (game === "pms") {
		return 20;
	}

	return null;
}
