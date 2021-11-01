import MiniTable from "components/tables/components/MiniTable";
import Divider from "components/util/Divider";
import prettyBytes from "pretty-bytes";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FileUploadImportTypes } from "tachi-common";
import { ImportStates, NotStartedState } from "types/import";
import { SetState } from "types/react";
import SubmitFile from "util/submit-file";
import ImportStateRenderer from "./ImportStateRenderer";

type ParseFunctionReturn = { valid: boolean; info: Record<string, React.ReactChild> };

export type MoreDataForm = ({
	setInfo,
	setFulfilled,
}: {
	setInfo: SetState<Record<string, string>>;
	setFulfilled: SetState<boolean>;
}) => JSX.Element;

export default function ImportFileInfo({
	name,
	acceptMime,
	parseFunction,
	importType,
	MoreDataForm,
}: {
	name: string;
	acceptMime: string | string[];
	parseFunction: (r: string) => ParseFunctionReturn;
	importType: FileUploadImportTypes;
	MoreDataForm?: MoreDataForm;
}) {
	const [file, setFile] = useState<File | null>(null);

	const [errMsg, setErrMsg] = useState<string | null>("");
	const [data, setData] = useState<ParseFunctionReturn | null>(null);
	const valid = useMemo(() => errMsg === null && file && file.size < 4e6, [errMsg]);

	const [moreInfo, setMoreInfo] = useState<Record<string, string>>({});
	const [moreInfoFulfilled, setMoreInfoFulfilled] = useState(!MoreDataForm);

	useEffect(() => {
		if (!file) {
			setErrMsg("");
			return;
		}

		file.text().then(r => {
			try {
				const { valid, info } = parseFunction(r);

				if (valid) {
					setErrMsg(null);
				}

				setData({ valid, info });
			} catch (err) {
				setErrMsg(err.message);
				setData({ valid: false, info: {} });
			}
		});
	}, [file]);

	const info = useMemo(() => {
		if (!file) {
			return null;
		}

		const isTooLarge = file.size > 4e6;

		if (!data || !file) {
			return null;
		}

		return (
			<MiniTable headers={["File Info"]} colSpan={2}>
				{Object.entries(data?.info).map(([k, v]) => (
					<tr key={k}>
						<td>{k}</td>
						<td>{v}</td>
					</tr>
				))}
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
			</MiniTable>
		);
	}, [errMsg, data]);

	const [importState, setImportState] = useState<ImportStates>(NotStartedState);

	return (
		<div>
			<Form.Group>
				<Form.Label>Upload {name} File</Form.Label>
				<input
					className="form-control"
					accept={Array.isArray(acceptMime) ? acceptMime.join(",") : acceptMime}
					type="file"
					id="batch-manual"
					multiple={false}
					onChange={e => setFile(e.target.files![0])}
				/>
			</Form.Group>
			{file && (
				<>
					{info}
					{errMsg ? <div className="text-danger text-center">Error: {errMsg}</div> : null}
					<Divider />
					{MoreDataForm ? (
						<>
							<MoreDataForm
								setInfo={setMoreInfo}
								setFulfilled={setMoreInfoFulfilled}
							/>
							<Divider />
						</>
					) : null}
					<div className="text-center">
						<div className="row justify-content-center mt-4">
							{valid && moreInfoFulfilled ? (
								<>
									{importState.state === "waiting" ? (
										<Button className="btn-primary" disabled>
											Processing...
										</Button>
									) : (
										<Button
											className="btn-primary"
											onClick={() =>
												SubmitFile(
													importType,
													file,
													setImportState,
													moreInfo
												)
											}
										>
											Submit File
										</Button>
									)}
								</>
							) : !valid ? (
								<Button className="btn-danger" disabled>
									There are errors in this {name} file, Can't upload.
								</Button>
							) : (
								<Button className="btn-warning" disabled>
									More fields need to be filled out.
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
