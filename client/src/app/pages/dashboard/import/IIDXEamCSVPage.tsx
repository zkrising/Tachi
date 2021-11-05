import ImportFileInfo, { MoreDataForm } from "components/imports/ImportFileInfo";
import useSetSubheader from "components/layout/header/useSetSubheader";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { FileUploadImportTypes } from "tachi-common";

export default function IIDXEamCSVPage({
	name,
	importType,
}: {
	name: string;
	importType: FileUploadImportTypes;
}) {
	useSetSubheader(["Import Scores", name]);

	return (
		<ImportFileInfo
			acceptMime="text/csv"
			importType={importType}
			name={name}
			parseFunction={ParseFunction}
			MoreDataForm={MoreDataForm}
		/>
	);
}

const MoreDataForm: MoreDataForm = ({ setFulfilled, setInfo }) => {
	const [state, setState] = useState<Record<string, string>>({});

	useEffect(() => {
		setInfo(state);
	}, [state]);

	return (
		<>
			<div className="alert alert-danger">
				Selecting your playtype here is <b>SUPER</b> important.
				<br />
				There is <b>ABSOLUTELY NO WAY</b> to know whether an e-am CSV is for SP or DP from
				the file alone.
				<br />
				If you input the wrong playtype here, you will corrupt your account. I'm serious.
				Don't make that mistake.
			</div>
			<select
				className="form-control"
				onChange={e => {
					const playtype = e.target.value;

					if (playtype === "") {
						setFulfilled(false);
					} else {
						setState({ ...state, playtype });
						setFulfilled(true);
					}
				}}
			>
				<option value="">Please select a playtype.</option>
				<option value="SP">SP</option>
				<option value="DP">DP</option>
			</select>
			<Form.Group className="mt-4">
				<Form.Check
					type="checkbox"
					checked={!!state.assertPlaytypeCorrect}
					onChange={e => {
						setState({
							...state,
							assertPlaytypeCorrect: e.target.checked ? "true" : "",
						});
					}}
					label="Disable Filename Checks"
				/>
				<Form.Text>
					<span className="text-warning">
						This will disable a safety feature of checking the uploaded filename for
						"SP" or "DP", and prevent you from accidentally selecting the wrong
						playtype.
						<br />
						Use this only if you get errors normally.
					</span>
				</Form.Text>
			</Form.Group>
		</>
	);
};

const PRE_HV_HEADER_COUNT = 27;
const HV_HEADER_COUNT = 41;

function ParseFunction(data: string) {
	const lines: string[] = data.split("\n");

	const headers = lines[0].split(",");

	if (headers.length !== HV_HEADER_COUNT && headers.length !== PRE_HV_HEADER_COUNT) {
		throw new Error(
			`Unexpected amount of headers in the file -- Expected ${HV_HEADER_COUNT} or ${PRE_HV_HEADER_COUNT}, received ${headers.length}. Is this an eamusement CSV?`
		);
	}

	if (lines.length === 1) {
		throw new Error(`This CSV has no scores? Only found headers.`);
	}

	const linesWithScores = lines.filter(e => e !== "");

	return {
		valid: true,
		info: {
			Scores: linesWithScores.length - 1,
			"Game Version": linesWithScores[linesWithScores.length - 1].split(",")[0],
		},
	};
}
