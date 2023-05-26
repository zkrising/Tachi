import Card from "components/layout/page/Card";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import React from "react";
import { ImportStates } from "types/import";
import ManageImport from "components/tables/dropdowns/components/ManageImport";
import ImportInfo from "./ImportInfo";

export default function ImportStateRenderer({ state: s }: { state: ImportStates }) {
	return (
		<Card header="Import Info" className="text-center">
			{s.state === "not_started" ? (
				<>Waiting for an import to start...</>
			) : s.state === "waiting_init" ? (
				<>
					<Loading />
					<div className="mt-2">
						We're processing your import. Depending on the amount of scores you have,
						this might take a while.
					</div>
				</>
			) : s.state === "waiting_processing" ? (
				<>
					<Loading />
					<div className="mt-2">
						We're processing your import. Depending on the amount of scores you have,
						this might take a while.
					</div>
					<Divider />
					<div>{s.progressInfo.description ?? "Importing."}..</div>
				</>
			) : s.state === "done" ? (
				<>
					Your import was successful!
					<Divider />
					<ImportInfo importID={s.import.importID} />
					<Divider />
					<div>
						<h4>Messed up?</h4>
						<ManageImport importDoc={s.import} />
					</div>
				</>
			) : (
				<>
					Your import has failed.
					<br />
					<span className="text-danger">{s.error}</span>
				</>
			)}
		</Card>
	);
}
