import { FileUploadImportTypes, ImportDocument } from "tachi-common";
import { ImportStates } from "types/import";
import { SetState } from "types/react";
import { APIFetchV1 } from "./api";

export default async function SubmitFile(
	type: FileUploadImportTypes,
	file: File,
	setState: SetState<ImportStates>,
	moreData: Record<string, string> = {}
) {
	const formData = new FormData();
	formData.append("importType", type);
	formData.append("scoreData", file);

	for (const [key, value] of Object.entries(moreData)) {
		formData.append(key, value);
	}

	setState({ state: "waiting" });

	const res = await APIFetchV1<ImportDocument>(
		"/import/file",
		{
			method: "POST",
			headers: {
				"X-User-Intent": "true",
			},
			body: formData,
		},
		true,
		true
	);

	if (res.success) {
		setState({ state: "done", import: res.body });
	} else {
		setState({ state: "failed", error: res.description });
	}
}
