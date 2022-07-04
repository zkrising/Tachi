/* eslint-disable no-await-in-loop */
import { APIFetchV1 } from "util/api";
import { Sleep } from "util/misc";
import { useState } from "react";
import { ImportDocument, integer } from "tachi-common";
import { ImportStates, NotStartedState } from "types/import";

export interface ImportDeferred {
	url: string;
	importID: string;
}

export type ImportPollStatus =
	| {
			importStatus: "completed";
			import: ImportDocument;
	  }
	| {
			importStatus: "ongoing";
			progress: {
				description: string;
				value: integer;
			};
	  };

export default function useImport(url: string, options: RequestInit) {
	const [importState, setImportState] = useState<ImportStates>(NotStartedState);

	const runImport = async (overrideOptions?: RequestInit) => {
		setImportState({ state: "waiting_init" });

		const initRes = await APIFetchV1<ImportDocument | ImportDeferred>(
			url,
			overrideOptions ?? options
		);

		if (!initRes.success) {
			setImportState({ state: "failed", error: initRes.description });
			return;
		}

		// 200 means the import was processed on-router.
		if (initRes.statusCode === 200) {
			const importRes = await APIFetchV1<ImportDocument>(`/imports/${initRes.body.importID}`);

			if (!importRes.success) {
				setImportState({ state: "failed", error: importRes.description });
				return;
			}

			setImportState({ state: "done", import: importRes.body as ImportDocument });
		} else if (initRes.statusCode === 202) {
			// 202 means the import is processing. We'll have to poll the
			// status of the import in real time to see whats happening.

			let isImportFinished = false;

			while (!isImportFinished) {
				const pollRes = await APIFetchV1<ImportPollStatus>(
					`/imports/${initRes.body.importID}/poll-status`
				);

				if (pollRes.success) {
					if (pollRes.body.importStatus === "completed") {
						isImportFinished = true;
						setImportState({ state: "done", import: pollRes.body.import });
					} else {
						setImportState({
							state: "waiting_processing",
							progressInfo: pollRes.body.progress,
						});

						await Sleep(1000);
					}
				} else {
					setImportState({ state: "failed", error: pollRes.description });
					isImportFinished = true;
				}
			}
		}
	};

	return { runImport, importState };
}
