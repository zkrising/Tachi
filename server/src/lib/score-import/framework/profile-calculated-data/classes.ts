import { CalculateDerivedClasses } from "../calculated-data/profile-classes";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import { EmitWebhookEvent } from "lib/webhooks/webhooks";
import { GetGPTString, GetGamePTConfig } from "tachi-common";
import { ReturnClassIfGreater } from "utils/class";
import type { ClassProvider } from "../calculated-data/types";
import type { KtLogger } from "lib/logger/logger";
import type {
	ClassDelta,
	Classes,
	GPTString,
	Game,
	Playtype,
	UserGameStats,
	integer,
	ExtractedClasses,
	AnyClasses,
} from "tachi-common";

/**
 * Calculates a User's Game Stats Classes. This function is rather complex, because the reality is rather complex.
 *
 * A class is simply a hard bounded division dependent on a user. Such as a Dan or a skill level dependent on a statistic.
 * Not all services expose this information in the same way, so this function takes an async resolve function,
 * which is allowed to return its own classes. These will be merged with the classes that *we* can calculate.
 *
 * As an example, we are always able to calculate things like Gitadora's colours. We know the user's skill statistic,
 * and a colour is just between X-Y skill. However, we cannot always calculate something like IIDX's dans. Infact,
 * there's no calculation involved. We need to instead request this information from a service. For things like FLO
 * they expose this on a dedicated endpoint.
 * The custom function allows us to request that data from a custom endpoint, and merge it with things we can always
 * calculate.
 *
 * @param ratings - A users ratings. This is calculated in rating.ts, and passed via update-ugs.ts.
 * We request this because we need it for things like gitadora's skill divisions - We don't need to calculate our skill
 * statistic twice if we just request it be passed to us!
 * @param ClassProvider - The Custom Resolve Function that certain import types may pass to us as a means
 * for providing information about a class. This returns the same thing as this function, and it is merged with the
 * defaults.
 */
export async function CalculateUGPTClasses(
	game: Game,
	playtype: Playtype,
	userID: integer,
	ratings: Record<string, number | null>,
	ClassProvider: ClassProvider | null,
	logger: KtLogger
): Promise<ExtractedClasses[GPTString]> {
	const gptString = GetGPTString(game, playtype);

	// Derive all classes first.
	let classes = CalculateDerivedClasses(gptString, ratings);

	// If this import method is providing us classes, merge those with the
	// other classes we have.
	if (ClassProvider) {
		logger.debug(`Calling custom class handler.`);
		const customClasses = (await ClassProvider(gptString, userID, ratings, logger)) ?? {};

		classes = deepmerge(customClasses, classes);
	}

	return classes;
}

/**
 * Calculates the class "deltas" for this users classes.
 * This is for calculating scenarios where a users class has improved (i.e. they have gone from 9th dan to 10th dan).
 *
 * If a class is provided, we don't want to potentially downgrade users. I.e.
 * if a user clears 7th dan while they're 10th dan, we don't want to downgrade them.
 *
 * For derived classes however, downgrading is fine.
 *
 * Knowing this information allows us to attach it onto the import, and also emit things on webhooks.
 * This function emits webhook events and inserts classachieved documents into the DB!
 */
export async function ProcessClassDeltas(
	game: Game,
	playtype: Playtype,
	classes: AnyClasses,
	userGameStats: UserGameStats | null,
	userID: integer,
	logger: KtLogger
): Promise<Array<ClassDelta>> {
	const gptString = GetGPTString(game, playtype);

	const deltas: Array<ClassDelta> = [];

	const achievementOps = [];

	const gptConfig = GetGamePTConfig(game, playtype);

	for (const s of Object.keys(classes)) {
		const classSet = s as Classes[GPTString];
		const classVal = classes[classSet];

		if (classVal === undefined || classVal === null) {
			logger.debug(`Skipped deltaing-class ${classSet}.`);
			continue;
		}

		const classConfig = gptConfig.classes[classSet]!;

		try {
			const isGreater = ReturnClassIfGreater(gptString, classSet, classVal, userGameStats);

			// if this was worse, and this class is PROVIDED (i.e. it's a dan)
			// then don't do anything
			if (isGreater === false && classConfig.type === "PROVIDED") {
				continue;
			} else {
				// otherwise, provide this as an update.
				// This *may* be negative in the case where the user downgraded a
				// downgradable class (i.e. deleted scores, chart re-rates).
				let delta: ClassDelta;

				if (isGreater === null) {
					delta = {
						game,
						set: classSet,
						playtype,
						old: null,
						new: classVal,
					};
				} else {
					delta = {
						game,
						set: classSet,
						playtype,
						old: userGameStats!.classes[classSet]!,
						new: classVal,
					};
				}

				// if this wasn't a downgrade
				if (isGreater !== false) {
					void EmitWebhookEvent({
						type: "class-update/v1",
						content: { userID, ...delta },
					});

					achievementOps.push({
						userID,
						classSet: delta.set,
						classOldValue: delta.old,
						classValue: delta.new,
						game,
						playtype,
						timeAchieved: Date.now(),
					});
				}

				deltas.push(delta);
			}
		} catch (err) {
			logger.error(err);
		}
	}

	await db["class-achievements"].insert(achievementOps);

	return deltas;
}
