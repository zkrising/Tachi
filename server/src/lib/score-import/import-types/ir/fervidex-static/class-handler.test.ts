import { CreateFerStaticClassProvider } from "./class-handler";
import CreateLogCtx from "lib/logger/logger";
import { IIDXDans } from "tachi-common/config/game-support/iidx";
import t from "tap";
import ResetDBState from "test-utils/resets";

const logger = CreateLogCtx(__filename);

t.test("#FerStaticClassProvider", (t) => {
	t.beforeEach(ResetDBState);

	t.test("Should curry a function", (t) => {
		const res = CreateFerStaticClassProvider({ sp_dan: 1 });

		t.equal(typeof res, "function");

		t.end();
	});

	t.test("Should work with no dans", (t) => {
		const res = CreateFerStaticClassProvider({})("iidx:SP", 1, {}, logger);

		t.equal(res, undefined, "Should return nothing.");

		t.end();
	});

	t.test("Should update the same dan as the playtype.", (t) => {
		const fn = CreateFerStaticClassProvider({ sp_dan: 5, dp_dan: 7 });
		const res = fn("iidx:SP", 1, {}, logger);

		t.strictSame(res, { dan: IIDXDans[5]!.id }, "Should return SP dan's value.");

		const res2 = fn("iidx:DP", 1, {}, logger);

		t.strictSame(res2, { dan: IIDXDans[7]!.id }, "Should return DP dan's value.");

		t.end();
	});

	t.test("Should skip if dan is invalid.", (t) => {
		const fn = CreateFerStaticClassProvider({ sp_dan: -1, dp_dan: 100 });
		const res = fn("iidx:SP", 1, {}, logger);

		t.equal(res, undefined, "Should skip SP dan's value.");

		const res2 = fn("iidx:DP", 1, {}, logger);

		t.equal(res2, undefined, "Should skip DP dan's value.");

		t.end();
	});

	t.test("Should skip if gpt is invalid", (t) => {
		const fn = CreateFerStaticClassProvider({ sp_dan: 5, dp_dan: 7 });
		const res = fn("bms:7K", 1, {}, logger);

		t.equal(res, undefined, "Should skip over as a failsafe.");

		t.end();
	});

	t.end();
});
