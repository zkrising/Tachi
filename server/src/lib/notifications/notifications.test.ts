import { BulkSendNotification, SendNotification } from "./notifications";
import db from "external/mongo/db";
import t from "tap";
import ResetDBState from "test-utils/resets";

t.test("#SendNotification", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should send a notification.", async (t) => {
		await SendNotification("title", 1, {
			type: "MILESTONE_CHANGED",
			content: { milestoneID: "foo" },
		});

		const dbRes = await db.notifications.findOne({
			sentTo: 1,
		});

		t.hasStrict(dbRes, {
			sentTo: 1,
			title: "title",
			read: false,
			body: {
				type: "MILESTONE_CHANGED",
				content: { milestoneID: "foo" },
			},
		});

		t.end();
	});

	t.end();
});

t.test("#BulkSendNotification", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should send multiple notifications.", async (t) => {
		await BulkSendNotification("title", [1, 2], {
			type: "MILESTONE_CHANGED",
			content: { milestoneID: "foo" },
		});

		const dbRes = await db.notifications.findOne({
			sentTo: 1,
		});

		t.hasStrict(dbRes, {
			sentTo: 1,
			title: "title",
			read: false,
			body: {
				type: "MILESTONE_CHANGED",
				content: { milestoneID: "foo" },
			},
		});

		const dbRes2 = await db.notifications.findOne({
			sentTo: 2,
		});

		t.hasStrict(dbRes2, {
			sentTo: 2,
			title: "title",
			read: false,
			body: {
				type: "MILESTONE_CHANGED",
				content: { milestoneID: "foo" },
			},
		});

		t.end();
	});

	t.end();
});
