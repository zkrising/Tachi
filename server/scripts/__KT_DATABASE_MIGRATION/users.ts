import db from "external/mongo/db";
import { PublicUserDocument, UserAuthLevels } from "tachi-common";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): PublicUserDocument {
	const newUserDoc: PublicUserDocument = {
		username: c.username,
		usernameLowercase: c.username.toLowerCase(),
		about: c.about,
		clan: c.clan,
		customBanner: c.custombanner,
		customPfp: c.custompfp,
		id: c.id,
		lastSeen: c.lastSeen,
		socialMedia: {
			discord: c.socialmedia.discord || null,
			twitter: c.socialmedia.twitter || null,
			youtube: c.socialmedia.youtube || null,
			twitch: c.socialmedia.twitch || null,
			github: c.socialmedia.github || null,
			steam: c.socialmedia.steam || null,
		},
		joinDate: 0,
		authLevel: UserAuthLevels.USER,
		status: null,
		badges: ["beta"],
	};

	return newUserDoc;
}

(async () => {
	await MigrateRecords(db.users, "users", ConvertFn);

	process.exit(0);
})();
