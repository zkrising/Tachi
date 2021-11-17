import { ImportDocument } from "tachi-common";

export type ImportStates =
	| { state: "not_started" }
	| { state: "waiting_init" }
	| { state: "waiting_processing"; progressInfo: { description: string } }
	| { state: "done"; import: ImportDocument }
	| { state: "failed"; error: string };

export const NotStartedState: ImportStates = { state: "not_started" };
