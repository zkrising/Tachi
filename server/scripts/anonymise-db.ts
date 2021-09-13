//
//

import CreateLogCtx from "lib/logger/logger";
import monk from "monk";

const logger = CreateLogCtx(__filename);

/**
 * Strips all name and private information from the database.
 * For use for things like future tachi-db-dumps?
 *
 * @param connectionString The database to anonymise. DO NOT PASS THE PRODUCTION DATABASE TO THIS!
 * Clone the database with mongodump->mongorestore (This is the documented way to clone a db.)
 */
async function CloneAndAnonymiseDB(connectionString: string) {
	logger.info(`Connecting to ${connectionString}.`);

	const clonedDB = monk(connectionString);

	logger.info(`Connected to ${connectionString}.`);

	const r1 = await clonedDB.get("user-private-information").update(
		{},
		[
			{
				$set: {
					// This is "password" encrypted in bcrypt12.
					password: "$2b$12$QRFCAxvFoNI2spszFPgt/e.qLy55GvYWlSHioa0AujRbFpChLwHmu",
					// emails are uniquely indexed. We need to anonymise these in
					// a way that they dont duplicate.
					email: { $concat: [{ $toString: "$userID" }, "@example.com"] },
				},
			},
		],
		{
			multi: true,
		}
	);

	logger.info(`Stripped private info.`, { r1 });

	const r2 = await clonedDB.get("users").update(
		{},
		[
			{
				$set: {
					socialMedia: { $const: {} },
				},
			},
			{
				$set: {
					username: { $concat: ["u", { $toString: "$id" }] },
					usernameLowercase: { $concat: ["u", { $toString: "$id" }] },
				},
			},
		],
		{
			multi: true,
		}
	);

	logger.info(`Stripped username info.`, { r2 });

	for (const collection of [
		"oauth2-clients",
		"oauth2-auth-codes",
		"password-reset-codes",
		"api-tokens",
		"kai-auth-tokens",
		"arc-saved-profiles",
	]) {
		// eslint-disable-next-line no-await-in-loop
		const r3 = await clonedDB.get("collection").remove({});

		logger.info(`Removed all ${collection} documents.`, { r3 });
	}
}

if (require.main === module) {
	// Maybe turn this into a commander program, it doesn't really matter.
	CloneAndAnonymiseDB(process.argv[2]);
}
