import { RemoveStaleFolderShowcaseStats } from "./showcase";
import db from "external/mongo/db";
import t from "tap";
import { mkFakeGameSettings } from "test-utils/misc";
import ResetDBState from "test-utils/resets";

t.test("#RemoveStaleFolderShowcaseStats", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(async () => {
		await db["game-settings"].remove({});
		await db["game-settings"].insert([
			mkFakeGameSettings(1, "iidx", "SP", {
				// @todo Make `mk` test functions deeply partial.
				// @ts-expect-error DeepPartial modifications to mkFakeGameSettings
				// is not currently possible.
				preferences: {
					stats: [
						{
							mode: "chart",
							chartID: "foo",
							property: "grade",
						},
						{
							mode: "folder",
							folderID: "REMOVED_FOLDER",
							gte: 1,
							property: "lamp",
						},
						{
							mode: "folder",
							folderID: "NORMAL_FOLDER",
							gte: 1,
							property: "lamp",
						},
					],
				},
			}),
			mkFakeGameSettings(2, "iidx", "SP", {
				// @ts-expect-error see above
				preferences: {
					stats: [
						{
							mode: "chart",
							chartID: "foo",
							property: "grade",
						},
						{
							mode: "folder",
							folderID: "REMOVED_FOLDER",
							gte: 1,
							property: "lamp",
						},
					],
				},
			}),
		]);
	});

	t.test("Should remove folder stats that refer to unused folders.", async (t) => {
		await RemoveStaleFolderShowcaseStats(["REMOVED_FOLDER"]);

		const dbResult = await db["game-settings"].find();

		t.strictSame(
			dbResult.map((e) => e.preferences.stats),
			[
				[
					{
						mode: "chart",
						chartID: "foo",
						property: "grade",
					},
					{
						mode: "folder",
						folderID: "NORMAL_FOLDER",
						gte: 1,
						property: "lamp",
					},
				],
				[
					{
						mode: "chart",
						chartID: "foo",
						property: "grade",
					},
				],
			]
		);

		t.end();
	});

	t.end();
});
