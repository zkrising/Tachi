import { SearchSpecificGameSongs, SearchUsersRegExp } from "./search";
import db from "external/mongo/db";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { LoadTachiIIDXData } from "test-utils/test-data";

t.test("#SearchSpecificGameSongs", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(LoadTachiIIDXData);
	t.beforeEach(async () => {
		await db.songs.iidx.dropIndexes();

		// Casting here is due to a known bug with monk.
		await db.songs.iidx.createIndex({
			title: "text",
			artist: "text",
			altTitles: "text",
			searchTerms: "text",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
	});

	t.test("Should return songs like the query.", async (t) => {
		const res = await SearchSpecificGameSongs("iidx", "amuro");

		// for simplicity of testing (and because the
		// return order is ambiguous) we sort on
		// songID here and expect this.
		t.strictSame(
			res.sort((a, b) => a.id - b.id).map((e) => e.title),
			[
				"A",
				"I'm In Love Again -Y&Co. EURO MIX-",
				"AA",
				"冥",
				"F",
				"HAERETICUS",
				"ZZ",
				"X",
				"AA -rebuild-",
				"∀",
				"-65℃",
			]
		);

		t.end();
	});

	t.end();
});

t.test("#SearchUsersRegExp", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should search users.", async (t) => {
		const res = await SearchUsersRegExp("zkldi");

		t.equal(res.length, 1);
		t.equal(res[0]?.usernameLowercase, "test_zkldi");

		const res2 = await SearchUsersRegExp("zk");

		t.equal(res2.length, 1);
		t.equal(res2[0]?.usernameLowercase, "test_zkldi");

		const res3 = await SearchUsersRegExp("zkzdi");

		t.equal(res3.length, 0);

		t.end();
	});

	t.end();
});
