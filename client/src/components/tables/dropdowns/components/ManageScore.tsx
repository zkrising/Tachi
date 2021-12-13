import React, { useMemo, useReducer, useState } from "react";
import { ScoreDocument } from "tachi-common";
import { APIFetchV1 } from "util/api";
import { DelayedPageReload } from "util/misc";

export default function ManageScore({ score }: { score: ScoreDocument }) {
	const [warn, upgWarn] = useReducer(r => r + 1, 0);
	const message = useMemo(() => {
		if (warn === 0) {
			return "Delete Score (Requires Further Confirmation)";
		} else if (warn === 1) {
			return "Are you absolutely sure? This score will be gone. Permanently.";
		} else if (warn === 2) {
			return "I'm serious. You will lose this score. It will be gone. Are you REALLY sure you want to do this?";
		} else if (warn === 3) {
			return "OK. Click me one last time, then.";
		}

		return "lol unknown state";
	}, [warn]);

	return (
		<div className="d-flex w-100 justify-content-center">
			<div
				className="btn btn-danger"
				onClick={() => {
					if (warn < 3) {
						upgWarn();
					} else {
						APIFetchV1(
							`/scores/${score.scoreID}`,
							{
								method: "DELETE",
							},
							true,
							true
						).then(() => DelayedPageReload());
					}
				}}
			>
				{message}
			</div>
		</div>
	);
}
