import useSetSubheader from "components/layout/header/useSetSubheader";
import MiniTable from "components/tables/components/MiniTable";
import Loading from "components/util/Loading";
import { TachiConfig } from "lib/config";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import {
	BatchManual,
	FileUploadImportTypes,
	FormatGame,
	GetGameConfig,
	GetGamePTConfig,
	ImportDocument,
} from "tachi-common";
import prettyBytes from "pretty-bytes";
import { SetState } from "types/react";
import Divider from "components/util/Divider";
import { APIFetchV1 } from "util/api";
import { ImportStates, NotStartedState } from "types/import";
import ImportStateRenderer from "components/imports/ImportStateRenderer";
import SubmitFile from "util/submit-file";
import ImportFileInfo from "components/imports/ImportFileInfo";

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
						`Invalid game ${data.meta.game}. Expected any of ${TachiConfig.supportedGames}.`
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
