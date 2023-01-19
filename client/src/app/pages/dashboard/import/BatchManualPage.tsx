import ImportFileInfo from "components/imports/ImportFileInfo";
import useSetSubheader from "components/layout/header/useSetSubheader";
import { TachiConfig } from "lib/config";
import React, { useState } from "react";
import {
	BatchManual,
	FormatGame,
	FormatPrError,
	GetGameConfig,
	GetGamePTConfig,
} from "tachi-common";
import { p } from "prudence";
import { PR_BATCH_MANUAL } from "tachi-common/lib/schemas";

export default function BatchManualPage() {
	useSetSubheader(["Dashboard", "Import Scores", "Batch Manual"]);

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
						`Invalid Playtype ${data.meta.playtype}. Expected any of ${gameConfig.playtypes}.`
					);
				}

				const err = p(data, PR_BATCH_MANUAL(data.meta.game, data.meta.playtype));

				if (err) {
					throw new Error(FormatPrError(err, "Invalid BATCH-MANUAL: "));
				}

				return {
					valid: true,
					info: {
						Game: FormatGame(data.meta.game, data.meta.playtype),
						Scores: data.scores.length,
					},
				};
			}}
		/>
	);
}
