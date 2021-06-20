import t from "tap";
import { GetGamePTConfig } from "../config/config";
import { CalculateESD, ESDCompare, PercentCompare } from "./esd";

function approx(t: Tap.Test, given: number, recieved: number, acc = 0.01) {
	if (Math.abs(given - recieved) < acc) {
		return t.pass();
	} else {
		return t.fail(`Expected ${given} to be within ${acc} of ${recieved}.`);
	}
}

t.test("#CalculateESD", (t) => {
	const jdg = GetGamePTConfig("iidx", "SP").judgementWindows!;
	approx(t, CalculateESD(jdg, 0.8), 17.58);
	approx(t, CalculateESD(jdg, 0), 200);
	t.throws(() => CalculateESD(jdg, 0, true));

	t.end();
});

t.test("#ESDCompare", (t) => {
	approx(t, ESDCompare(16, 14), 6.42);
	approx(t, ESDCompare(16, 14, 1), ESDCompare(16, 14));
	approx(t, ESDCompare(0, 200, 1), -68.27);

	t.end();
});

t.test("#PercentCompare", (t) => {
	const jdg = GetGamePTConfig("iidx", "SP").judgementWindows!;
	approx(t, PercentCompare(jdg, 0.99, 0.98), -5.53);
	approx(t, PercentCompare(jdg, 0.99, 0.98), PercentCompare(jdg, 0.99, 0.98, 1));

	t.end();
});
