/* eslint-disable @typescript-eslint/no-explicit-any */
import { TierlistParent, Game } from "tachi-common";
import { gameHuman, validPlaytypes } from "tachi-common/js/config";
import db from "../../src/external/mongo/db";
import MigrateRecords from "./migrate";

function ConvertFn(c: any): TierlistParent {
	const tierlistParent: TierlistParent = {
		createdAt: Date.now(),
		tierlistID: c.tierlistID,
		createdBy: 1,
		description: `The official Kamaitachi Tierlist for ${gameHuman[c.game as Game]}${
			validPlaytypes[c.game as Game].length > 1 ? ` (${c.playtype})` : ""
		}.`,
		game: c.game,
		playtype: c.playtype,
		isDefault: true,
		name: c.title,
		lastUpdated: Date.now(),
		permissions: {
			anyPlayer: {
				edit: 0,
				submit: 1,
				vote: 1,
			},
		},
		config: {
			autoHumanise: false,
			flags: ["Individual Difference"],
			requireState: "clear",
		},
	};

	return tierlistParent;
}

(async () => {
	await MigrateRecords(db.tierlists, "tierlist", ConvertFn);

	process.exit(0);
})();
