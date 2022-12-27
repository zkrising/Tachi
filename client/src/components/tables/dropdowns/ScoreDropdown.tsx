import DebugContent from "components/util/DebugContent";
import HasDevModeOn from "components/util/HasDevModeOn";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useReducer, useState } from "react";
import {
	ChartDocument,
	IDStrings,
	PBScoreDocument,
	ScoreDocument,
	SongDocument,
	UserDocument,
} from "tachi-common";
import { GoalsOnChartReturn, UGPTChartPBComposition } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import { GPTDropdownSettings } from "./GPTDropdownSettings";
import DocComponentCreator, { DocumentComponentType } from "./components/DocumentComponent";
import DropdownStructure from "./components/DropdownStructure";
import ManageScore from "./components/ManageScore";
import PBCompare from "./components/PBCompare";
import PlayHistory from "./components/PlayHistory";
import RivalCompare from "./components/RivalCompare";
import TargetInfo from "./components/TargetInfo";

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
	song,
	scoreState,
	thisScore,
	defaultView = "moreInfo",
}: {
	user: UserDocument;
	chart: ChartDocument;
	song: SongDocument;
	scoreState: ScoreState;
	defaultView?: "vsPB" | "moreInfo" | "history" | "debug" | "manage" | "rivals" | "targets";
	thisScore: ScoreDocument;
} & GamePT) {
	const DocComponent: DocumentComponentType = (props) =>
		DocComponentCreator({
			renderScoreInfo: false,
			...props,
			...GPTDropdownSettings(game, playtype),
		});

	const [view, setView] = useState(defaultView);
	const { user: currentUser } = useContext(UserContext);
	const { settings } = useLUGPTSettings();

	const { data, error } = useApiQuery<UGPTChartPBComposition<I>>(
		`/users/${user.id}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`
	);

	const { error: histError, data: histData } = useApiQuery<ScoreDocument<I>[]>(
		`/users/${user.id}/games/${game}/${playtype}/scores/${chart.chartID}`
	);

	const [shouldRefresh, forceRefresh] = useReducer((state) => state + 1, 0);

	const { error: targetError, data: targetData } = useApiQuery<GoalsOnChartReturn>(
		`/users/${currentUser?.id ?? ""}/games/${game}/${playtype}/targets/on-chart/${
			chart.chartID
		}`,
		undefined,
		[shouldRefresh],
		// when a user isn't logged in, skip ever making this request.
		currentUser === null
	);

	if (error) {
		return <>An error has occurred. Whoops.</>;
	}

	if (!data) {
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
				game={game}
				playtype={playtype}
				data={histData}
				chart={chart}
			/>
		);
	} else if (view === "debug") {
		body = <DebugContent data={data} />;
	} else if (view === "moreInfo") {
		body = (
			<DocComponent
				score={thisScore as any}
				scoreState={scoreState}
				pbData={data}
				chart={chart}
			/>
		);
	} else if (view === "vsPB") {
		body = <PBCompare data={data} DocComponent={DocComponent} scoreState={scoreState} />;
	} else if (view === "manage") {
		body = <ManageScore score={thisScore} />;
	} else if (view === "targets") {
		if (currentUser) {
			body = (
				<TargetInfo
					game={game}
					playtype={playtype}
					reqUser={currentUser}
					data={targetData}
					error={targetError}
					chart={chart}
					song={song}
					onGoalSet={forceRefresh}
				/>
			);
		} else {
			body = <>not possible, shouldn't've got here.</>;
		}
	} else if (view === "rivals") {
		body = <RivalCompare chart={chart} game={game} />;
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
						Play History{histData && ` (${histData.length})`}
					</SelectButton>
					{currentUser?.id === user.id && (
						<SelectButton setValue={setView} value={view} id="targets">
							<Icon type="scroll" />
							Goals & Quests{targetData && ` (${targetData.goals.length})`}
						</SelectButton>
					)}
					{currentUser?.id === user.id && settings?.rivals && (
						<SelectButton setValue={setView} value={view} id="rivals">
							<Icon type="users" />
							Rivals
						</SelectButton>
					)}
					{currentUser?.id === user.id && (
						<SelectButton setValue={setView} value={view} id="manage">
							<Icon type="trash" />
							Delete Score
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
