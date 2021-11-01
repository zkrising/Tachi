import ImportFileInfo from "components/imports/ImportFileInfo";
import useSetSubheader from "components/layout/header/useSetSubheader";
import React from "react";

export default function MerJSONPage() {
	useSetSubheader(["Import Scores", "MER .json"]);

	return (
		<ImportFileInfo
			acceptMime="application/json"
			importType="file/mer-iidx"
			name="MER .json"
			parseFunction={ParseFunction}
		/>
	);
}

function ParseFunction(d: string) {
	const json = JSON.parse(d);

	if (!Array.isArray(json)) {
		throw new Error(`Expected a JSON array. Is this valid MER?`);
	}

	return {
		valid: true,
		info: {
			Scores: json.length,
		},
	};
}
