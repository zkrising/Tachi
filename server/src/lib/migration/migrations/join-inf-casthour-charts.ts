/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import UpdateScore from "lib/score-mutation/update-score";
import type { Migration } from "utils/types";

// old chart -> new chart
const mappings = [
	["4ff8e32a6eefee5e476f6c8261db5c66e2496b51", "1de27f681eb00b8d422658b66507c5f438379e40"],
	["827b1f8cccce51d3e2e0fd2c0b1117a47b530c70", "96bf5cd64056bca7e870233eb1096e8bb24d24b7"],
	["43a7b6386da6b0c5d2d577c9f09ab83d516038a2", "764f6c14f4be643fe4d6e7715a77d4f5789a255e"],
	["ad0a143262671e970c3e148b62d4aaebec17f604", "2981d53beda743071c0174b3235e8b811c227231"],
	["69093ac77208326f1261b3dcc38f73d054b0400e", "f7fb763afd99981232c92a41a6c3276692551101"],
	["2f8bac0550e95c87f4ff4c931c49d118622d320d", "1d4025230032b8ee6ce787e80756286a1626dc04"],
	["2b2dc7bc90eb7715fda937a263878dc16c3df507", "78f3fcd2765233c1d588ea588d1416a45065b272"],
	["3cf992f0615ab51903d45fda6d4fda5ed5ec5c7c", "9b6eac3a3f152a43e3ef297130677daa42d895fd"],
	["fb4a6ca054b9697a34841afc52f52d7d100a5779", "6264bb33e8ab53e226cd514696789dd330ab13fc"],
	["4ee3a65c0ab0968ed3c52bf90753cfa7620fee94", "03efef860d7aa122dd601853d99b73622b560aa6"],
	["28c1ca0d1ef50f56d05e3143a1cde25e9b25a1ef", "1e112b872267c0b66fb64671ef2c8aedff8bcf7e"],
	["1cdb02868c5a23ca4c3131f9cf0403b7ef178b83", "bbe64b3d1158db2f1255eb342bafe165ba2871e5"],
	["29d7c72e8ed01173f7f68fb8102706694ba80619", "9d96ec36c37f7f723d3851618e7daef6d58a5176"],
	["4d3d3ae0760c520b471a6c4025fd4517e792fdd5", "e42f30c04bcdd07ccf46470c8ce321814c69f62f"],
	["5d2b11fc4d26b965dd30094c06548a55a670408c", "ee22f91a9be8826ef3b371ef9c3ab518d34753b0"],
	["46d3a5c245898f8fbc2492e293a8dadcfaff363c", "92efb4e0d1b036e385cb5a73a0ace0e12baaa0cc"],
	["39ed6d4a5c7a4557ab00266fae2363a6094fc0e1", "02218c7580fffe984d5db15e3ac9703c7c5ff42c"],
	["6e5231055e517dbe6f67d68f572286b1c647eceb", "ef2359505d0be7492dacc4b416d7528f669b4228"],
] as const;

const migration: Migration = {
	id: "join-inf-casthour-charts",
	up: async () => {
		for (const [oldChartID, newChartID] of mappings) {
			const scores = await db.scores.find({
				chartID: oldChartID,
			});

			for (const score of scores) {
				await UpdateScore(score, { ...score, chartID: newChartID });
			}
		}
	},
	down: () => {
		throw new Error(`Cannot undo migration.`);
	},
};

export default migration;
