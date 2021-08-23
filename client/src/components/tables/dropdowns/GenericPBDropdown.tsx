import DebugContent from "components/util/DebugContent";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import React, { useContext, useMemo, useState } from "react";
import DropdownStructure from "./components/DropdownStructure";
import {
	PublicUserDocument,
	ChartDocument,
	ScoreDocument,
	PBScoreDocument,
	IDStrings,
} from "tachi-common";
import { GamePT, SetState } from "types/react";
import { useQuery } from "react-query";
import { APIFetchV1 } from "util/api";
import { UGPTChartPBComposition } from "types/api-returns";
import Loading from "components/util/Loading";
import { UserContext } from "context/UserContext";
import GenericScoreContentDropdown from "./components/GenericScoreContentDropdown";
import PlayHistory from "./components/PlayHistory";
import useApiQuery from "components/util/query/useApiQuery";

export interface ScoreState {
	highlight: boolean;
	setHighlight: SetState<boolean>;
}

export interface ScoreDropdownProps<I extends IDStrings = IDStrings> {
	score: ScoreDocument<I> | PBScoreDocument<I>;
	scoreState: ScoreState;
	pbData: UGPTChartPBComposition<I>;
}

export default function GenericPBDropdown<I extends IDStrings = IDStrings>({
	game,
	playtype,
	reqUser,
	chart,
	scoreState,
	defaultView = "pb",
	DocComponent = GenericScoreContentDropdown,
}: {
	reqUser: PublicUserDocument;
	chart: ChartDocument;
	scoreState: ScoreState;
	defaultView?: "pb" | "scorePB" | "lampPB" | "history" | "debug";
	DocComponent?: (props: {
		score: ScoreDocument<I> | PBScoreDocument<I>;
		scoreState: ScoreState;
		showSingleScoreNote?: boolean;
		pbData: UGPTChartPBComposition<I>;
	}) => JSX.Element;
} & GamePT) {
	const { user } = useContext(UserContext);
	const [view, setView] = useState(defaultView);

	const { isLoading, error, data } = useApiQuery<UGPTChartPBComposition<I>>(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`
	);

	const { isLoading: histIsLoading, error: histError, data: histData } = useApiQuery<
		ScoreDocument<I>[]
	>(`/users/${reqUser.id}/games/${game}/${playtype}/scores/${chart.chartID}`);

	const currentScoreDoc: ScoreDocument<I> | PBScoreDocument<I> | null = useMemo(() => {
		if (!data) {
			// dont worry about this null, it never gets below the rquery checks
			return null;
		}

		if (view === "pb") {
			if (data.pb.composedFrom.lampPB === data.pb.composedFrom.scorePB) {
				// scores have more information than PBs.
				// In this case, the PB is only composed of one score,
				// so we should default to this instead.
				return data.scores[0];
			}
			return data.pb;
		}

		const idMap = {
			scorePB: data.pb.composedFrom.scorePB,
			lampPB: data.pb.composedFrom.lampPB,
			...Object.fromEntries((data.pb.composedFrom.other ?? []).map(e => [e.name, e.scoreID])),
		};

		// @ts-expect-error awful
		return data.scores.filter(e => e.scoreID === idMap[view])[0];
	}, [view, data]);

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

	// @TODO this doesn't support alternate PBs.
	const isComposedFromSingleScore = data.pb.composedFrom.lampPB === data.pb.composedFrom.scorePB;

	let body;

	if (view === "history") {
		body = (
			<PlayHistory
				data={histData}
				error={histError}
				isLoading={histIsLoading}
				game={game}
				playtype={playtype}
			/>
		);
	} else if (view === "debug") {
		body = <DebugContent data={data} />;
	} else {
		body = (
			<DocComponent
				score={currentScoreDoc!}
				showSingleScoreNote={isComposedFromSingleScore}
				pbData={data}
				scoreState={scoreState}
			/>
		);
	}

	return (
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="pb">
						<Icon type="trophy" />
						PB Info
					</SelectButton>
					{!isComposedFromSingleScore && (
						<>
							<SelectButton setValue={setView} value={view} id="scorePB">
								<Icon type="star-half-alt" />
								Best Score
							</SelectButton>
							<SelectButton setValue={setView} value={view} id="lampPB">
								<Icon type="lightbulb" />
								Best Lamp
							</SelectButton>
						</>
					)}
					<SelectButton setValue={setView} value={view} id="history">
						<Icon type="history" />
						Play History{histData && ` (${histData.length})`}
					</SelectButton>
					{user?.authLevel === "admin" && (
						<SelectButton setValue={setView} value={view} id="debug">
							<Icon type="bug" />
							Debug Info
						</SelectButton>
					)}
				</>
			}
		>
			{body}
		</DropdownStructure>
	);
}
