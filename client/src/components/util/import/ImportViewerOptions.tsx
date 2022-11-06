import Card from "components/layout/page/Card";
import { TachiConfig } from "lib/config";
import React from "react";
import { SetState } from "types/react";
import Select from "../Select";

export default function ImportViewerOptions({
	userIntent,
	setUserIntent,
	importType,
	setImportType,
}: {
	userIntent: string | null;
	setUserIntent: SetState<string | null>;
	importType: string | null;
	setImportType: SetState<string | null>;
}) {
	return (
		<>
			<Card header="Options">
				<Select
					name="Made with intent (i.e. not by an automated hook or IR)"
					allowNull
					unselectedName="Either"
					setValue={setUserIntent}
					value={userIntent}
				>
					<option value="true">Yes</option>
					<option value="false">No</option>
				</Select>
				<br />
				<Select
					name="Import Type?"
					allowNull
					unselectedName="Any"
					setValue={setImportType}
					value={importType}
				>
					{TachiConfig.importTypes.map((e) => (
						<option key={e} value={e}>
							{e}
						</option>
					))}
				</Select>
			</Card>
		</>
	);
}
