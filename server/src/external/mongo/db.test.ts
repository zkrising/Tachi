import t from "tap";
import { CloseAllConnections } from "../../test-utils/close-connections";
import ResetDBState from "../../test-utils/resets";
import db from "./db";

t.beforeEach(ResetDBState);

t.test("ID field autoprojection", async (t) => {
	const res = await db.scores.findOne();
	t.equal(res!._id, undefined);

	// @ts-expect-error todo: #205 type properly
	const res2 = await db.scores.findOne({}, { projectID: true });
	t.not(res2!._id, undefined);

	const res3 = await db.scores.findOne({}, { projection: { scoreID: 1 } });
	t.equal(res3!._id, undefined);

	// @ts-expect-error todo: #205 type properly
	const res4 = await db.scores.findOne({}, { projection: { scoreID: 1 }, projectID: true });
	t.not(res4!._id, undefined);

	const res5 = await db.scores.findOne({}, { projection: { scoreID: 0 } });
	t.equal(res5!._id, undefined);

	// @ts-expect-error todo: #205 type properly
	const res6 = await db.scores.findOne({}, { projection: { scoreID: 0 }, projectID: true });
	t.not(res6!._id, undefined);

	t.end();
});

t.teardown(CloseAllConnections);
