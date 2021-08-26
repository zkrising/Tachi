import t from "tap";
import { CloseAllConnections } from "test-utils/close-connections";
import { uscChart, uscScore } from "test-utils/test-data";
import CreateLogCtx from "lib/logger/logger";
import { ParseIRUSC } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#ParseIRUSC", (t) => {
	t.test("Should validate and convert a score into an iterable", (t) => {
		const res = ParseIRUSC(
			{ score: uscScore } as unknown as Record<string, unknown>,
			uscChart,
			logger
		);

		t.hasStrict(res, {
			game: "usc",
			context: {
				chart: uscChart,
			},
			iterable: [uscScore],
		});

		t.end();
	});

	t.test("Should reject empty bodies", (t) => {
		t.throws(() => ParseIRUSC({}, uscChart, logger), {
			statusCode: 400,
			message: /invalid usc score/iu,
		} as any);

		t.end();
	});

	t.end();
});
