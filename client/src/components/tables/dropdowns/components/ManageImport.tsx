import { APIFetchV1 } from "util/api";
import { DelayedPageReload } from "util/misc";
import React, { useMemo, useReducer } from "react";
import { Button } from "react-bootstrap";
import { ImportDocument } from "tachi-common";

export default function ManageImport({ importDoc }: { importDoc: ImportDocument }) {
	const [warn, upgWarn] = useReducer((r) => r + 1, 0);
	const message = useMemo(() => {
		if (warn === 0) {
			return "Undo Import (Requires Further Confirmation)";
		} else if (warn === 1) {
			return "Are you absolutely sure? This import, and *everything* as a result of it, will be undone.";
		} else if (warn === 2) {
			return `I'm serious. You will lose ${importDoc.scoreIDs.length} score(s). They will be gone. Are you REALLY sure you want to do this?`;
		} else if (warn === 3) {
			return "OK. Click me one last time, then.";
		} else if (warn === 4) {
			return "Reverting import...";
		}

		return "lol unknown state";
	}, [warn]);

	return (
		<div className="d-flex w-100 justify-content-center">
			<Button
				disabled={warn >= 4}
				variant="danger"
				className="btn btn-danger"
				onClick={() => {
					if (warn < 3) {
						upgWarn();
					} else {
						upgWarn();
						APIFetchV1(
							`/imports/${importDoc.importID}/revert`,
							{
								method: "POST",
							},
							true,
							true
						).then(() => DelayedPageReload());
					}
				}}
			>
				{message}
			</Button>
		</div>
	);
}
