import ImportFileInfo from "components/imports/ImportFileInfo";
import useSetSubheader from "components/layout/header/useSetSubheader";
import { TachiConfig } from "lib/config";
import React, { useState } from "react";
import { BatchManual, FormatGame, GetGameConfig, GetGamePTConfig } from "tachi-common";
import { ImportStates, NotStartedState } from "types/import";

export default function BatchManualPage() {
	useSetSubheader(["Dashboard", "Import Scores", "Batch Manual"]);

	const [file, setFile] = useState<File | null>(null);
	const [valid, setValid] = useState(false);
	const [importState, setImportState] = useState<ImportStates>(NotStartedState);

	return (
		<ImportFileInfo
			acceptMime="application/json"
			name="Batch Manual"
			importType="file/batch-manual"
			parseFunction={(text: string) => {
				const data: BatchManual = JSON.parse(text);

				const gameConfig = GetGameConfig(data.meta.game);

				if (!gameConfig) {
					throw new Error(
						`Invalid game ${data.meta.game}. Expected any of ${TachiConfig.games}.`
					);
				}

				const gptConfig = GetGamePTConfig(data.meta.game, data.meta.playtype);

				if (!gptConfig) {
					throw new Error(
						`Invalid Playtype ${data.meta.playtype}. Expected any of ${gameConfig.validPlaytypes}.`
					);
				}

				return {
					valid: true,
					info: {
						game: FormatGame(data.meta.game, data.meta.playtype),
						scores: data.scores.length,
					},
				};
			}}
		/>
	);
}
