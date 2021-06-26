import t from "tap";
import ResetDBState from "../../../../../test-utils/resets";
import { CloseAllConnections } from "../../../../../test-utils/close-connections";

// const valid511Score = {
// 	bp: "12",
// 	difficulty: "ANOTHER" as const, // lol
// 	exscore: "192",
// 	great: "42",
// 	pgreat: "75",
// 	lamp: "HARD CLEAR",
// 	level: "10",
// };

// const converterContext = {
// 	playtype: "SP" as const,
// 	hasBeginnerAndLegg: false,
// 	importVersion: "27",
// 	service: "e-amusement",
// };

// const data = {
// 	scores: [valid511Score],
// 	timestamp: "Tue, 27 Apr 2021 21:35:35 GMT",
// 	title: "5.1.1",
// };

t.todo("#ConverterFn", async (t) => {
	t.beforeEach(ResetDBState);

	t.end();
});

t.teardown(CloseAllConnections);
