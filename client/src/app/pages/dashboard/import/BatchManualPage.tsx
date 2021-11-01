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

export default function BatchManualPage() {
	useSetSubheader(["Dashboard", "Import Scores", "Batch Manual"]);

	const [file, setFile] = useState<File | null>(null);
	const [valid, setValid] = useState(false);
	const [importState, setImportState] = useState<ImportStates>(NotStartedState);

	return (
		<div>
			<Form.Group>
				<Form.Label>Upload Batch Manual File</Form.Label>
				<input
					className="form-control"
					accept="application/json"
					type="file"
					id="batch-manual"
					multiple={false}
					onChange={e => setFile(e.target.files![0])}
				/>
			</Form.Group>
			{file && (
				<>
					<div className="text-center">
						<BatchManualInfo setValid={setValid} file={file} />
						<div className="row justify-content-center mt-4">
							{valid ? (
								<Button
									className="btn-primary"
									onClick={() =>
										SubmitFile("file/batch-manual", file, setImportState)
									}
								>
									Submit File
								</Button>
							) : (
								<Button className="btn-danger" disabled>
									There are errors in this Batch Manual file, Can't upload.
								</Button>
							)}
						</div>
					</div>
					<Divider />
					<ImportStateRenderer state={importState} />
				</>
			)}
		</div>
	);
}

function BatchManualInfo({ file, setValid }: { file: File; setValid: SetState<boolean> }) {
	const [text, setText] = useState<string | null>(null);

	file.text().then(r => {
		setText(r);
	});

	if (text === null) {
		return <Loading />;
	}

	try {
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

		const isTooLarge = file.size > 4e6;

		if (isTooLarge) {
			setValid(false);
		} else {
			setValid(true);
		}

		return (
			<MiniTable headers={["Batch Manual Info"]} colSpan={2}>
				<tr>
					<td>Game</td>
					<td>{FormatGame(data.meta.game, data.meta.playtype)}</td>
				</tr>
				<tr>
					<td>Scores</td>
					<td>{data.scores.length}</td>
				</tr>
				<tr>
					<td>File Size</td>
					<td>
						<span className={isTooLarge ? "text-danger" : ""}>
							{prettyBytes(file.size)}
							{isTooLarge
								? " (File too large, Can't be larger than 4MB. Sorry!)"
								: ""}
						</span>
					</td>
				</tr>
				<tr>
					<td>Service Name</td>
					<td>{data.meta.service}</td>
				</tr>
			</MiniTable>
		);
	} catch (err) {
		setValid(false);

		return (
			<div>
				<span className="text-danger">Invalid Batch-Manual? {err.message}</span>
			</div>
		);
	}
}
