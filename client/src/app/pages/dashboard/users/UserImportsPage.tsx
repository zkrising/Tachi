import useSetSubheader from "components/layout/header/useSetSubheader";
import FailedImportsTable from "components/tables/imports/FailedImportsTable";
import ImportsTable from "components/tables/imports/ImportsTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import ImportViewerOptions from "components/util/import/ImportViewerOptions";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import SelectLinkButton from "components/util/SelectLinkButton";
import React, { useMemo, useState } from "react";
import { Route, Switch } from "react-router-dom";
import { ImportDocument, ImportTrackerFailed, PublicUserDocument } from "tachi-common";
import { FailedImportDataset, ImportDataset } from "types/tables";

export default function UserImportsPage({ reqUser }: { reqUser: PublicUserDocument }) {
	useSetSubheader(
		["Users", reqUser.username, "Imports"],
		[reqUser],
		`${reqUser.username}'s Imports`
	);

	// honestly yanked straight from ImportAnalysers.tsx.
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
			<div className="d-flex justify-content-center btn-group">
				<SelectLinkButton to={`/dashboard/users/${reqUser.username}/imports`}>
					Recent Imports
				</SelectLinkButton>
				<SelectLinkButton to={`/dashboard/users/${reqUser.username}/imports/failed`}>
					Recent Failed Imports
				</SelectLinkButton>
			</div>

			<Divider />
			<ImportViewerOptions {...{ userIntent, setUserIntent, importType, setImportType }} />
			<Divider />
			<Switch>
				<Route exact path={`/dashboard/users/${reqUser.username}/imports`}>
					<ViewRecentImports params={params} reqUser={reqUser} />
				</Route>

				<Route path={`/dashboard/users/${reqUser.username}/imports/failed`}>
					<ViewRecentFailedImports params={params} reqUser={reqUser} />
				</Route>
			</Switch>
		</>
	);
}

function ViewRecentImports({
	params,
	reqUser,
}: {
	params: URLSearchParams;
	reqUser: PublicUserDocument;
}) {
	const { data, error } = useApiQuery<Array<ImportDocument>>(
		`/users/${reqUser.id}/imports?${params.toString()}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const dataset: ImportDataset = data.map((e) => ({
		__related: {
			user: reqUser,
		},
		...e,
	}));

	return <ImportsTable dataset={dataset} />;
}

function ViewRecentFailedImports({
	params,
	reqUser,
}: {
	params: URLSearchParams;
	reqUser: PublicUserDocument;
}) {
	const { data, error } = useApiQuery<Array<ImportTrackerFailed>>(
		`/users/${reqUser.id}/imports/failed?${params.toString()}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const dataset: FailedImportDataset = data.map((e) => ({
		__related: {
			user: reqUser,
		},
		...e,
	}));

	return <FailedImportsTable dataset={dataset} />;
}
