import { ParseIRUSC } from "./parser";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import { TestingUSCChart, uscScore } from "test-utils/test-data";

const logger = CreateLogCtx(__filename);

t.test("#ParseIRUSC", (t) => {
	t.test("Should validate and convert a score into an iterable", (t) => {
		const res = ParseIRUSC(
			{ score: uscScore } as unknown as Record<string, unknown>,
			TestingUSCChart.data.hashSHA1 as string,
			"Controller",
			logger
		);

		t.hasStrict(res, {
			game: "usc",
			context: {
				chartHash: TestingUSCChart.data.hashSHA1,
			},
			iterable: [uscScore],
		});

		t.end();
	});

	t.test("Should reject empty bodies", (t) => {
		t.throws(
			() => ParseIRUSC({}, TestingUSCChart.data.hashSHA1 as string, "Controller", logger),
			{
				statusCode: 400,
				message: /invalid usc score/iu,
			}
		);

		t.end();
	});

	t.end();
});
