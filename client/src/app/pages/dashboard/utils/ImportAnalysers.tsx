import { CreateUserMap } from "util/data";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import ImportsTable from "components/tables/imports/ImportsTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import Select from "components/util/Select";
import SelectLinkButton from "components/util/SelectLinkButton";
import { TachiConfig } from "lib/config";
import React, { useMemo, useState } from "react";
import { Route, Switch } from "react-router-dom";
import { FailedImportsReturn, ImportsReturn } from "types/api-returns";
import { SetState } from "types/react";
import { FailedImportDataset, ImportDataset } from "types/tables";
import FailedImportsTable from "components/tables/imports/FailedImportsTable";

export default function ImportAnalysers() {
	useSetSubheader(["Developer Utils", "Import Analyser"]);

	const [userIntent, setUserIntent] = useState<string | null>(null);
	const [importType, setImportType] = useState<string | null>(null);

	const params = useMemo(() => {
		const p = new URLSearchParams();

		if (userIntent) {
			p.set("userIntent", userIntent);
		}

		if (importType) {
			p.set("importType", importType);
		}

		return p;
	}, [userIntent, importType]);

	return (
		<>
			<h1>{TachiConfig.name} Database Management</h1>
			<Divider />
			<span>
				This tool is for viewing imports that have came through to {TachiConfig.name}.
				<br />
				From here, if you are an administrator, you can revert successful imports, or view
				failed imports and see why they failed and what input was given.
			</span>
			<Divider />
			<div className="d-flex justify-content-center btn-group">
				<SelectLinkButton to="/dashboard/utils/imports">Recent Imports</SelectLinkButton>
				<SelectLinkButton to="/dashboard/utils/imports/failed">
					Recent Failed Imports
				</SelectLinkButton>
			</div>

			<Divider />
			<ImportViewerOptions {...{ userIntent, setUserIntent, importType, setImportType }} />
			<Divider />
			<Switch>
				<Route exact path="/dashboard/utils/imports">
					<ViewRecentImports params={params} />
				</Route>

				<Route exact path="/dashboard/utils/imports/failed">
					<ViewRecentFailedImports params={params} />
				</Route>
			</Switch>
		</>
	);
}

function ViewRecentImports({ params }: { params: URLSearchParams }) {
	const { data, error } = useApiQuery<ImportsReturn>(`/imports?${params.toString()}`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const userMap = CreateUserMap(data.users);

	const dataset: ImportDataset = data.imports.map((e) => ({
		__related: {
			user: userMap.get(e.userID)!,
		},
		...e,
	}));

	return <ImportsTable dataset={dataset} />;
}

function ViewRecentFailedImports({ params }: { params: URLSearchParams }) {
	const { data, error } = useApiQuery<FailedImportsReturn>(
		`/imports/failed?${params.toString()}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const userMap = CreateUserMap(data.users);

	const dataset: FailedImportDataset = data.failedImports.map((e) => ({
		__related: {
			user: userMap.get(e.userID)!,
		},
		...e,
	}));

	return <FailedImportsTable dataset={dataset} />;
}

function ImportViewerOptions({
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
					name="User Intent?"
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
