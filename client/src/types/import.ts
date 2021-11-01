import { ImportDocument } from "tachi-common";

export type ImportStates =
	| { state: "not_started" }
	| { state: "waiting" }
	| { state: "done"; import: ImportDocument }
	| { state: "failed"; error: string };

export const NotStartedState: ImportStates = { state: "not_started" };
