import t from "tap";
import db from "../../external/mongo/db";
import { CloseAllConnections } from "../../test-utils/close-connections";
import ResetDBState from "../../test-utils/resets";
import { LoadKTBlackIIDXData } from "../../test-utils/test-data";
import { SearchGameSongs } from "./search";

t.test("#SearchGameSongs", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadKTBlackIIDXData);
	t.beforeEach(async () => {
		await db.songs.iidx.dropIndexes();
		await db.songs.iidx.createIndex(
			{
				title: "text",
				artist: "text",
				"alt-titles": "text",
				"search-titles": "text",
			} as any /* known bug with monk */
		);
	});

	t.test("Should return songs like the query.", async (t) => {
		const res = await SearchGameSongs("iidx", "amuro");

		t.strictSame(
			// for simplicity of testing (and because the
			// return order is ambiguous) we sort on
			// songID here and expect this.
			res.sort((a, b) => a.id - b.id).map((e) => e.title),
			["A", "AA", "冥", "F", "HAERETICUS", "ZZ", "X", "AA -rebuild-", "∀"]
		);

		t.end();
	});

	t.end();
});

t.teardown(CloseAllConnections);
