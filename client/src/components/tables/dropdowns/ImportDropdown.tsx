import ImportInfo from "components/imports/ImportInfo";
import DebugContent from "components/util/DebugContent";
import HasDevModeOn from "components/util/HasDevModeOn";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import { UserContext } from "context/UserContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useState } from "react";
import { Col } from "react-bootstrap";
import { UserAuthLevels } from "tachi-common";
import { ImportDataset } from "types/tables";
import DropdownStructure from "./components/DropdownStructure";
import ImportInputViewer from "./components/ImportInputViewer";
import ManageImport from "./components/ManageImport";

export default function ImportDropdown({ data }: { data: ImportDataset[0] }) {
	const [view, setView] = useState<"input" | "info" | "manage" | "debug">("info");
	const { user: currentUser } = useContext(UserContext);
	const { settings } = useContext(UserSettingsContext);

	let body;

	if (view === "debug") {
		body = <DebugContent data={data} />;
	} else if (view === "info") {
		body = (
			<Col xs={12}>
				<ImportInfo importID={data.importID} noTopTable />
			</Col>
		);
	} else if (view === "input") {
		body = (
			<Col xs={12}>
				<ImportInputViewer importID={data.importID} importType={data.importType} />
			</Col>
		);
	} else if (view === "manage") {
		body = <ManageImport importDoc={data} />;
	}

	return (
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="info">
						<Icon type="exclamation-triangle" />
						Import Info
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="input">
						<Icon type="database" />
						Input
					</SelectButton>
					{(currentUser?.id === data.userID && settings?.preferences.deletableScores) ||
						(currentUser?.authLevel === UserAuthLevels.ADMIN && (
							<SelectButton setValue={setView} value={view} id="manage">
								<Icon type="trash" />
								Manage Import
							</SelectButton>
						))}
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
