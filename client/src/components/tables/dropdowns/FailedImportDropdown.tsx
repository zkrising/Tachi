import DebugContent from "components/util/DebugContent";
import HasDevModeOn from "components/util/HasDevModeOn";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import React, { useState } from "react";
import { Col } from "react-bootstrap";
import { FailedImportDataset } from "types/tables";
import DropdownStructure from "./components/DropdownStructure";
import ImportInputViewer from "./components/ImportInputViewer";

export default function FailedImportDropdown({ data }: { data: FailedImportDataset[0] }) {
	const [view, setView] = useState<"input" | "debug">("input");

	let body;

	if (view === "debug") {
		body = <DebugContent data={data} />;
	} else if (view === "input") {
		body = (
			<Col xs={12}>
				<ImportInputViewer importID={data.importID} importType={data.importType} />
			</Col>
		);
	}

	return (
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="input">
						<Icon type="database" />
						Input
					</SelectButton>
					<HasDevModeOn>
						<SelectButton setValue={setView} value={view} id="debug">
							<Icon type="bug" />
							Debug Info
						</SelectButton>
					</HasDevModeOn>
				</>
			}
		>
			{body}
		</DropdownStructure>
	);
}
