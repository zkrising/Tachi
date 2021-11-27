import SessionRaiseBreakdown from "components/sessions/SessionRaiseBreakdown";
import DebugContent from "components/util/DebugContent";
import HasDevModeOn from "components/util/HasDevModeOn";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { SessionReturns } from "types/api-returns";
import { APIFetchV1 } from "util/api";
import { SessionDataset } from "../sessions/GenericSessionTable";
import DropdownStructure from "./components/DropdownStructure";

export default function GenericSessionDropdown({ data }: { data: SessionDataset[0] }) {
	const { isLoading, error, data: sessionData } = useQuery(
		`/sessions/${data.sessionID}`,
		async () => {
			const res = await APIFetchV1<SessionReturns>(`/sessions/${data.sessionID}`);

			if (!res.success) {
				throw new Error(res.description);
			}

			return res.body;
		}
	);

	const [view, setView] = useState<"raises" | "debug">("raises");

	if (error) {
		return <>{(error as Error).message}</>;
	}

	if (isLoading || !sessionData) {
		return <Loading />;
	}

	let content;

	if (view === "raises") {
		content = <SessionRaiseBreakdown sessionData={sessionData} />;
	} else if (view === "debug") {
		content = <DebugContent data={sessionData} />;
	}

	return (
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="raises">
						<Icon type="receipt" />
						Raises
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
			{content}
		</DropdownStructure>
	);
}
