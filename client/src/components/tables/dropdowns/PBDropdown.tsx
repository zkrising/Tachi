import ApiError from "components/util/ApiError";
import DebugContent from "components/util/DebugContent";
import HasDevModeOn from "components/util/HasDevModeOn";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { UserContext } from "context/UserContext";
import React, { useContext, useMemo, useReducer, useState } from "react";
import { ChartDocument, integer, PBScoreDocument, ScoreDocument, SongDocument } from "tachi-common";
import { GoalsOnChartReturn, UGPTChartPBComposition } from "types/api-returns";
import { GamePT } from "types/react";
import DocComponentCreator, {
	DocumentComponentType,
	ScoreState,
} from "./components/DocumentComponent";
import DropdownStructure from "./components/DropdownStructure";
import PlayHistory from "./components/PlayHistory";
import RivalCompare from "./components/RivalCompare";
import TargetInfo from "./components/TargetInfo";
import { GPTDropdownSettings } from "./GPTDropdownSettings";

export interface ScoreDropdownProps {
	score: ScoreDocument | PBScoreDocument;
	scoreState: ScoreState;
	pbData: UGPTChartPBComposition;
	chart: ChartDocument;
}

export default function PBDropdown({
	game,
	playtype,
	chart,
	scoreState,
	defaultView = "pb",
	userID,
	song,
}: {
	userID: integer;
	chart: ChartDocument;
	song: SongDocument;
	scoreState: ScoreState;
	defaultView?: "pb" | `otherPB::${string}` | "history" | "debug" | "rivals" | "targets";
} & GamePT) {
	const { user: currentUser } = useContext(UserContext);

	const DocComponent: DocumentComponentType = (props) =>
		DocComponentCreator({ ...props, ...GPTDropdownSettings(game, playtype) });

	const [view, setView] = useState(defaultView);

	const { data, error } = useApiQuery<UGPTChartPBComposition>(
		`/users/${userID}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`
	);

	const { error: histError, data: histData } = useApiQuery<ScoreDocument[]>(
		`/users/${userID}/games/${game}/${playtype}/scores/${chart.chartID}`
	);

	const [shouldRefresh, forceRefresh] = useReducer((state) => state + 1, 0);

	// when a user isn't logged in, skip ever making this request.
	const { error: targetError, data: targetData } = useApiQuery<GoalsOnChartReturn>(
		`/users/${currentUser?.id ?? ""}/games/${game}/${playtype}/targets/on-chart/${
			chart.chartID
		}`,
		undefined,
		[shouldRefresh],
		currentUser === null
	);

	const currentScoreDoc: ScoreDocument | PBScoreDocument | null = useMemo(() => {
		if (!data) {
			// dont worry about this null, it never gets below the rquery checks
			return null;
		}

		if (view === "pb") {
			if (data.pb.composedFrom.length === 1) {
				// scores have more information than PBs.
				// In this case, the PB is only composed of one score,
				// so we should default to this instead.
				return data.scores.find((e) => e.scoreID === data.pb.composedFrom[0]!.scoreID)!;
			}

			return data.pb;
		} else if (view.startsWith("otherPB::")) {
			const scoreID = view.split("otherPB::")[1];

			return data.scores.filter((e) => e.scoreID === scoreID)[0];
		}

		return null;
	}, [view, data]);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return (
			<div style={{ height: "200px" }} className="d-flex align-items-center">
				<Loading />
			</div>
		);
	}

	const isComposedFromSingleScore = data.pb.composedFrom.length === 1;

	let body;

	if (view === "history") {
		body = (
			<PlayHistory
				data={histData}
				error={histError}
				game={game}
				playtype={playtype}
				chart={chart}
			/>
		);
	} else if (view === "debug") {
		body = <DebugContent data={data} />;
	} else if (view === "rivals") {
		body = <RivalCompare chart={chart} game={game} />;
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
	} else {
		body = (
			<DocComponent
				score={currentScoreDoc!}
				showSingleScoreNote={isComposedFromSingleScore}
				pbData={data}
				scoreState={scoreState}
				chart={chart}
			/>
		);
	}

	return (
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="pb">
						<Icon type="trophy" /> PB Info
					</SelectButton>
					{!isComposedFromSingleScore && (
						<>
							{data.pb.composedFrom.map((e) => (
								<SelectButton
									setValue={setView}
									value={view}
									id={`otherPB::${e.scoreID}`}
								>
									<Icon type="star-half-alt" /> {e.name}
								</SelectButton>
							))}
						</>
					)}
					<SelectButton setValue={setView} value={view} id="history">
						<Icon type="history" /> Play History{histData && ` (${histData.length})`}
					</SelectButton>
					{currentUser?.id === userID && (
						<SelectButton setValue={setView} value={view} id="targets">
							<Icon type="scroll" /> Goals & Quests
							{targetData && ` (${targetData.goals.length})`}
						</SelectButton>
					)}
					{currentUser && (
						<SelectButton setValue={setView} value={view} id="rivals">
							<Icon type="users" /> Rivals
						</SelectButton>
					)}
					<HasDevModeOn>
						<SelectButton setValue={setView} value={view} id="debug">
							<Icon type="bug" /> Debug Info
						</SelectButton>
					</HasDevModeOn>
				</>
			}
		>
			{body}
		</DropdownStructure>
	);
}
