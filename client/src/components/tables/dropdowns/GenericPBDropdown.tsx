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

export interface ScoreState {
	highlight: boolean;
	setHighlight: SetState<boolean>;
}

export interface ScoreDropdownProps<I extends IDStrings = IDStrings> {
	score: ScoreDocument<I> | PBScoreDocument<I>;
	scoreState: ScoreState;
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
	}) => JSX.Element;
} & GamePT) {
	const { user } = useContext(UserContext);
	const [view, setView] = useState(defaultView);

	const { isLoading, error, data } = useQuery(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`,
		async () => {
			const res = await APIFetchV1<UGPTChartPBComposition<I>>(
				`/users/${reqUser.id}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`
			);

			if (!res.success) {
				throw new Error(res.description);
			}

			return res.body;
		}
	);

	const currentScoreDoc: ScoreDocument<I> | PBScoreDocument<I> | null = useMemo(() => {
		if (!data) {
			// dont worry about this null, it never gets below the rquery checks
			return null;
		}

		if (view === "pb") {
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

	let body;

	if (view === "history") {
		body = <></>; // todo
	} else if (view === "debug") {
		body = <DebugContent data={data} />;
	} else {
		body = <DocComponent score={currentScoreDoc!} scoreState={scoreState} />;
	}

	return (
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="pb">
						<Icon type="trophy" />
						PB Info
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="scorePB">
						<Icon type="star-half-alt" />
						Best Score
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="lampPB">
						<Icon type="lightbulb" />
						Best Lamp
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="history" disabled>
						<Icon type="history" />
						Play History
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
