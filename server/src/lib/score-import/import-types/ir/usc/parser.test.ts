import t from "tap";
import { uscChart, uscScore } from "test-utils/test-data";
import CreateLogCtx from "lib/logger/logger";
import { ParseIRUSC } from "./parser";

const logger = CreateLogCtx(__filename);

t.test("#ParseIRUSC", (t) => {
	t.test("Should validate and convert a score into an iterable", (t) => {
		const res = ParseIRUSC(
			{ score: uscScore } as unknown as Record<string, unknown>,
			uscChart.data.hashSHA1 as string,
			logger
		);

		t.hasStrict(res, {
			game: "usc",
			context: {
				chartHash: uscChart.data.hashSHA1,
			},
			iterable: [uscScore],
		});

		t.end();
	});

	t.test("Should reject empty bodies", (t) => {
		t.throws(() => ParseIRUSC({}, uscChart.data.hashSHA1 as string, logger), {
			statusCode: 400,
			message: /invalid usc score/iu,
		});

		t.end();
	});

	t.end();
});
