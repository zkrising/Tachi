import ApiError from "components/util/ApiError";
import DebugContent from "components/util/DebugContent";
import HasDevModeOn from "components/util/HasDevModeOn";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import React, { useMemo, useState } from "react";
import { ChartDocument, IDStrings, integer, PBScoreDocument, ScoreDocument } from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT } from "types/react";
import DocComponentCreator, {
	DocumentComponentType,
	ScoreState,
} from "./components/DocumentComponent";
import DropdownStructure from "./components/DropdownStructure";
import PlayHistory from "./components/PlayHistory";
import { GPTDropdownSettings } from "./GPTDropdownSettings";

export interface ScoreDropdownProps<I extends IDStrings = IDStrings> {
	score: ScoreDocument<I> | PBScoreDocument<I>;
	scoreState: ScoreState;
	pbData: UGPTChartPBComposition<I>;
}

export default function PBDropdown<I extends IDStrings = IDStrings>({
	game,
	playtype,
	chart,
	scoreState,
	defaultView = "pb",
	userID,
}: {
	userID: integer;
	chart: ChartDocument;
	scoreState: ScoreState;
	defaultView?: "pb" | "scorePB" | "lampPB" | "history" | "debug";
} & GamePT) {
	const DocComponent: DocumentComponentType = props =>
		DocComponentCreator({ ...props, ...GPTDropdownSettings(game, playtype) });

	// const { settings } = useContext(UserSettingsContext);

	const [view, setView] = useState(defaultView);

	const { isLoading, error, data } = useApiQuery<UGPTChartPBComposition<I>>(
		`/users/${userID}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`
	);

	const { isLoading: histIsLoading, error: histError, data: histData } = useApiQuery<
		ScoreDocument<I>[]
	>(`/users/${userID}/games/${game}/${playtype}/scores/${chart.chartID}`);

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
				return data.scores.filter(e => e.scoreID === data.pb.composedFrom.lampPB)[0];
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
		return <ApiError error={error} />;
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
