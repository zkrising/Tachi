import { client } from "../main";
import { GetGoalWithID, GetUserInfo } from "../utils/apiRequests";
import { CreateEmbed } from "../utils/embeds";
import logger from "../utils/logger";
import { GetGameChannel, Pluralise } from "../utils/misc";
import { GetGameConfig } from "tachi-common";
import type { GoalDocument, integer, WebhookEventGoalAchievedV1 } from "tachi-common";

export async function HandleGoalAchievedV1(
	event: WebhookEventGoalAchievedV1["content"]
): Promise<integer> {
	const { game } = event;

	let channel;

	try {
		channel = GetGameChannel(client, game);
	} catch (e) {
		const err = e as Error;

		logger.error(`ClassUpdate handler failed: ${err.message}`);
		return 500;
	}

	const userDoc = await GetUserInfo(event.userID);

	const goalDocuments = await Promise.all(
		event.goals.map((e) => GetGoalWithID(e.goalID, game, e.playtype))
	);

	const goalMap = new Map<string, GoalDocument>();

	for (const goalDoc of goalDocuments) {
		goalMap.set(goalDoc.goalID, goalDoc);
	}

	const gameConfig = GetGameConfig(game);

	const shouldShowPlaytype = gameConfig.playtypes.length !== 1;

	const embed = CreateEmbed(userDoc.id)
		.setTitle(
			`${userDoc.username} just achieved ${event.goals.length} ${Pluralise(
				event.goals.length,
				"goal"
			)}!`
		)
		.addFields(
			event.goals.map((e) => {
				const goal = goalMap.get(e.goalID)!;

				// if the outOf value changed (it might), note that
				// in the embed.
				const value =
					e.old.outOf === e.new.outOf
						? `${e.old.progressHuman} -> ${e.new.progressHuman}`
						: `${e.old.progressHuman}/${e.old.outOfHuman} -> ${e.new.progressHuman}/${e.new.outOfHuman}`;

				return {
					name: `${goal.name}${shouldShowPlaytype ? ` (${e.playtype})` : ""}`,
					value,
				};
			})
		);

	await channel.send({ embeds: [embed] });

	return 200;
}
