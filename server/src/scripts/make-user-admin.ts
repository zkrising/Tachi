import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { UserAuthLevels } from "tachi-common";
import { WrapScriptPromise } from "utils/misc";
import { FormatUserDoc, ResolveUser } from "utils/user";

const userID = process.argv[2];

const logger = CreateLogCtx(__filename);

async function MakeUserAdmin(userID: string) {
	const user = await ResolveUser(userID);

	if (!user) {
		logger.error(`No such user '${userID}' exists.`);
		throw new Error(`No such user '${userID}' exists.`);
	}

	await db.users.update(
		{
			id: user.id,
		},
		{
			$set: {
				authLevel: UserAuthLevels.ADMIN,
			},
		}
	);

	logger.info(`Made ${FormatUserDoc(user)} an administrator.`);
}

if (!userID) {
	logger.error(`Usage: pnpm make-user-admin <userID>.`);
	throw new Error(`No userID provided.`);
}

if (require.main === module) {
	WrapScriptPromise(MakeUserAdmin(userID), logger);
}
