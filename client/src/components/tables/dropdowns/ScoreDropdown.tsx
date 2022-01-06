import DebugContent from "components/util/DebugContent";
import HasDevModeOn from "components/util/HasDevModeOn";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { UserContext } from "context/UserContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useState } from "react";
import {
	ChartDocument,
	IDStrings,
	PBScoreDocument,
	PublicUserDocument,
	ScoreDocument,
} from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import DocComponentCreator, { DocumentComponentType } from "./components/DocumentComponent";
import DropdownStructure from "./components/DropdownStructure";
import ManageScore from "./components/ManageScore";
import PBCompare from "./components/PBCompare";
import PlayHistory from "./components/PlayHistory";
import { GPTDropdownSettings } from "./GPTDropdownSettings";

export interface ScoreState {
	highlight: boolean;
	setHighlight: SetState<boolean>;
}

export interface ScoreDropdownProps<I extends IDStrings = IDStrings> {
	score: ScoreDocument<I> | PBScoreDocument<I>;
	scoreState: ScoreState;
}

export default function ScoreDropdown<I extends IDStrings = IDStrings>({
	game,
	playtype,
	user,
	chart,
	scoreState,
	thisScore,
	defaultView = "moreInfo",
}: {
	user: PublicUserDocument;
	chart: ChartDocument;
	scoreState: ScoreState;
	defaultView?: "vsPB" | "moreInfo" | "history" | "debug" | "manage";
	thisScore: ScoreDocument;
} & GamePT) {
	const DocComponent: DocumentComponentType = props =>
		DocComponentCreator({
			renderScoreInfo: false,
			...props,
			...GPTDropdownSettings(game, playtype),
		});

	const [view, setView] = useState(defaultView);
	const { user: currentUser } = useContext(UserContext);
	const { settings } = useContext(UserSettingsContext);

	const { isLoading, error, data } = useApiQuery<UGPTChartPBComposition<I>>(
		`/users/${user.id}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`
	);

	const { isLoading: histIsLoading, error: histError, data: histData } = useApiQuery<
		ScoreDocument<I>[]
	>(`/users/${user.id}/games/${game}/${playtype}/scores/${chart.chartID}`);

	if (error) {
		return <>An error has occured. Whoops.</>;
	}

	if (isLoading || !data) {
		return (
			<div style={{ height: "200px" }} className="d-flex align-items-center">
				<Loading />
			</div>
		);
	}

	let body;

	if (view === "history") {
		body = (
			<PlayHistory
				error={histError}
				isLoading={histIsLoading}
				game={game}
				playtype={playtype}
				data={histData}
			/>
		);
	} else if (view === "debug") {
		body = <DebugContent data={data} />;
	} else if (view === "moreInfo") {
		body = <DocComponent score={thisScore as any} scoreState={scoreState} pbData={data} />;
	} else if (view === "vsPB") {
		body = <PBCompare data={data} DocComponent={DocComponent} scoreState={scoreState} />;
	} else if (view === "manage") {
		body = <ManageScore score={thisScore} />;
	}

	return (
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="moreInfo">
						<Icon type="chart-bar" />
						This Score
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="vsPB">
						<Icon type="trophy" />
						Chart PB
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="history">
						<Icon type="history" />
						Play History
					</SelectButton>
					{currentUser?.id === user.id && settings?.preferences.deletableScores && (
						<SelectButton setValue={setView} value={view} id="manage">
							<Icon type="trash" />
							Manage Score
						</SelectButton>
					)}
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
