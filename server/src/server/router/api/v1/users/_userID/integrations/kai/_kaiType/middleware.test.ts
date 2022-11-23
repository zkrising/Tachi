import { ValidateKaiType } from "./middleware";
import t from "tap";
import { expressRequestMock } from "test-utils/mock-request";

t.test("#ValidateKaiType", (t) => {
	const k = async (k: string) => {
		const { res } = await expressRequestMock(ValidateKaiType, { params: { kaiType: k } });

		return res.statusCode;
	};

	t.test("Should allow flo, eag or min, case insensitively.", async (t) => {
		t.equal(await k("flo"), 200);
		t.equal(await k("eag"), 200);
		t.equal(await k("min"), 200);
		t.equal(await k("FLO"), 200);
		t.equal(await k("EAG"), 200);
		t.equal(await k("MIN"), 200);
		t.equal(await k("FlO"), 200);
		t.equal(await k("EaG"), 200);
		t.equal(await k("MiN"), 200);
		t.equal(await k("nonsense"), 400);
		t.equal(await k("bad"), 400);
		t.equal(await k(""), 400);
		t.equal(await k("FLO2"), 400);
		t.equal(await k("2FLO"), 400);

		t.end();
	});

	t.end();
});
