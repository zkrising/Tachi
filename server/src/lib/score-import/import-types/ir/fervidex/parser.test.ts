import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { SoftwareIDToVersion } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#SoftwareIDToVersion", (t) => {
	const f = (sid: string) => SoftwareIDToVersion(sid, logger);

	t.throws(() => f("a"), {}, "Should throw on invalid string.");
	t.throws(() => f("LDJ:J:B:Q:2020092900"), {}, "Should throw on unknown HV revision.");
	t.throws(() => f("LDJ:J:B:Q:2021091500"), {}, "Should throw on unknown BST revision.");
	t.throws(() => f("XDJ:J:B:A:2020092900"), {}, "Should throw on unknown model.");
	t.throws(() => f("LDJ:J:B:A:2099092900"), {}, "Should throw on unknown ext.");

	t.equal(f("LDJ:J:B:A:2020092900"), "27");
	t.equal(f("LDJ:J:B:X:2020092900"), "27-omni");
	t.equal(f("LDJ:J:B:E:2020092900"), "27-2dxtra");
	t.equal(f("LDJ:J:B:A:2021091500"), "28");
	t.equal(f("LDJ:J:B:X:2021091500"), "28-omni");
	t.equal(f("LDJ:J:B:E:2021091500"), "28-2dxtra");

	t.equal(f("TDJ:J:B:A:2020092900"), "27");
	t.equal(f("TDJ:J:B:X:2020092900"), "27-omni");
	t.equal(f("TDJ:J:B:E:2020092900"), "27-2dxtra");
	t.equal(f("TDJ:J:B:A:2021091500"), "28");
	t.equal(f("TDJ:J:B:X:2021091500"), "28-omni");
	t.equal(f("TDJ:J:B:E:2021091500"), "28-2dxtra");

	t.equal(f("P2D:J:B:A:2020092900"), "inf");

	t.end();
});
