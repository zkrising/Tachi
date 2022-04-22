import db from "external/mongo/db";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { FAKE_MIGRATION } from "test-utils/test-data";
import { ApplyMigration, FindUnappliedMigrations } from "./migrations";

t.test("#FindUnappliedMigrations", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should find all unapplied migrations", async (t) => {
		const res = await FindUnappliedMigrations();

		t.equal(
			res.includes("fake-migration"),
			true,
			"Should contain fake-migration since it isn't applied."
		);

		t.end();
	});

	t.test("Shouldn't return pending migrations", async (t) => {
		await db.migrations.insert({
			migrationID: "fake-migration",
			status: "pending",
		});

		const res = await FindUnappliedMigrations();

		t.equal(res.includes("fake-migration"), false);

		t.end();
	});

	t.test("Shouldn't return applied migrations", async (t) => {
		await db.migrations.insert({
			migrationID: "fake-migration",
			status: "applied",
			appliedOn: 1000,
		});

		const res = await FindUnappliedMigrations();

		t.equal(res.includes("fake-migration"), false);

		t.end();
	});

	t.end();
});

t.test("#ApplyMigration", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should apply a migration.", async (t) => {
		await ApplyMigration(FAKE_MIGRATION);

		const dbRes = await db.users.findOne({
			id: 1,
		});

		t.equal(
			// @ts-expect-error Our migration is a fake one that adds __wasMigrated
			// to all user documents. There's nothing special about this property name.
			dbRes?.__wasMigrated,
			true,
			"Migration should be applied on the users."
		);

		t.end();
	});

	t.test("Should panic and reset if something goes wrong.", async (t) => {
		try {
			await ApplyMigration({
				id: "bad-migration",
				up: () => {
					throw new Error("Failed to migrate.");
				},
				down: () =>
					db.users.update({}, { $set: { __wasUnmigrated: true } }, { multi: true }),
			});
		} catch (e) {
			const err = e as Error;
			t.equal(err?.message, "Was going to exit with statusCode 1, but we're in testing.");
		}

		const dbRes = await db.users.findOne({
			id: 1,
		});

		t.equal(
			// @ts-expect-error Our un-migration adds this property to check if it worked.
			dbRes?.__wasUnmigrated,
			true,
			"Migration should be applied on the users."
		);

		t.end();
	});

	t.test(
		"Should panic and panic again if un-migration failed, with a scarier log message.",
		async (t) => {
			try {
				await ApplyMigration({
					id: "bad-migration",
					up: () => {
						throw new Error("Failed to migrate.");
					},
					down: () => {
						throw new Error("Failed to undo migration.");
					},
				});
			} catch (e) {
				const err = e as Error;
				t.equal(err?.message, "Was going to exit with statusCode 1, but we're in testing.");
			}

			t.end();
		}
	);

	t.end();
});
