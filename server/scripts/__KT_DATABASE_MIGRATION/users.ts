import { PrivateUserDocument } from "tachi-common";
import db from "../../src/db/db";
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
		friends: c.friends,
		id: c.id,
		lastSeen: c.lastSeen,
		password: c.password,
		permissions: {},
		settings: {
			invisible: !!c.settings.invisible,
			nsfwSplashes: !!c.settings.nsfwsplashes,
		},
		socialMedia: {
			discord: c.socialmedia.discord || null,
			twitter: c.socialmedia.twitter || null,
			youtube: c.socialmedia.youtube || null,
			twitch: c.socialmedia.twitch || null,
			github: c.socialmedia.github || null,
			steam: c.socialmedia.steam || null,
		},
	};

	return newUserDoc;
}

(async () => {
	await MigrateRecords(db.users, "users", ConvertFn);

	process.exit(0);
})();
