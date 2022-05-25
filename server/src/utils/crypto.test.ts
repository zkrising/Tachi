import { HashSHA256 } from "./crypto";
import t from "tap";

t.test("#HashSHA256", (t) => {
	t.equal(
		HashSHA256(Buffer.from("something")),
		"3fc9b689459d738f8c88a3a48aa9e33542016b7a4052e001aaa536fca74813cb",
		"'something' should hash into its expected value."
	);

	t.end();
});
