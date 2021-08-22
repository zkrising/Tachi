import { PrivateUserDocument } from "tachi-common";
import db from "external/mongo/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): PrivateUserDocument {
	const newUserDoc: PrivateUserDocument = {
		username: c.username,
		usernameLowercase: c.username.toLowerCase(),
		about: c.about,
		clan: c.clan,
		customBanner: c.custombanner,
		customPfp: c.custompfp,
		email: c.email,
		id: c.id,
		lastSeen: c.lastSeen,
		password: c.password,
		socialMedia: {
			discord: c.socialmedia.discord || null,
			twitter: c.socialmedia.twitter || null,
			youtube: c.socialmedia.youtube || null,
			twitch: c.socialmedia.twitch || null,
			github: c.socialmedia.github || null,
			steam: c.socialmedia.steam || null,
		},
		joinDate: 0,
		authLevel: "user",
		badges: ["beta"],
	};

	return newUserDoc;
}

(async () => {
	await MigrateRecords(db.users, "users", ConvertFn);

	process.exit(0);
})();
