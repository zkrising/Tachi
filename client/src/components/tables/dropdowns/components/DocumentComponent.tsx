import { IsScore } from "util/asserts";
import { UppercaseFirst } from "util/misc";
import TimestampCell from "components/tables/cells/TimestampCell";
import ScoreCoreCells from "components/tables/game-core-cells/ScoreCoreCells";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useEffect, useState } from "react";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { SetState } from "types/react";
import CommentContainer from "./CommentContainer";
import JudgementTable from "./JudgementTable";
import PBNote from "./PBNote";
import ScoreEditButtons from "./ScoreEditButtons";

export function ScoreInfo({
	score,
	chart,
}: {
	score: ScoreDocument | PBScoreDocument;
	chart: ChartDocument;
}) {
	const rating = useScoreRatingAlg(score.game, score.playtype);

	return (
		<div className="col-12">
			<table className="table">
				<thead>
					<tr>
						<td colSpan={3}>Score Info</td>
						<td>{UppercaseFirst(rating)}</td>
						<td>Timestamp</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<ScoreCoreCells
							game={score.game}
							score={score}
							rating={rating}
							chart={chart}
						/>
						{/* @ts-expect-error yeah we know service doesnt necessarily exist */}
						<TimestampCell time={score.timeAchieved} service={score?.service} />
					</tr>
				</tbody>
			</table>
		</div>
	);
}

export interface ScoreState {
	highlight: boolean;
	setHighlight: SetState<boolean>;
}

export type DocumentComponentType = typeof DocumentComponent;

export default function DocumentComponent({
	score,
	scoreState,
	renderScoreInfo = true,
	showSingleScoreNote = false,
	GraphComponent = null,
	forceScoreData = false,
	pbData,
	chart,
}: {
	score: ScoreDocument | PBScoreDocument;
	scoreState: { highlight: boolean; setHighlight: SetState<boolean> };
	renderScoreInfo?: boolean;
	showSingleScoreNote?: boolean;
	pbData: UGPTChartPBComposition;
	forceScoreData?: boolean;
	chart: ChartDocument;
	GraphComponent?:
		| (({
				score,
				chart,
		  }: {
				score: ScoreDocument | PBScoreDocument;
				chart: ChartDocument;
		  }) => JSX.Element)
		| null;
}) {
	const [comment, setComment] = useState(IsScore(score) ? score.comment : null);

	useEffect(() => {
		setComment(IsScore(score) ? score.comment : null);
	}, [score]);

	return (
		<>
			<div className="col-9">
				<div className="row h-100 justify-content-center">
					{GraphComponent ? (
						<GraphComponent chart={chart} score={score} />
					) : (
						<div className="d-flex align-items-center" style={{ height: "200px" }}>
							<span className="text-muted">No graphs available :(</span>
						</div>
					)}

					{IsScore(score) ? (
						<>
							{renderScoreInfo && !showSingleScoreNote && (
								<ScoreInfo score={score} chart={chart} />
							)}
							<CommentContainer comment={comment} />
							{showSingleScoreNote && (
								<div className="col-12">
									<PBNote />
									<br />
									<small>
										In this case, your best lamp and your best score were the
										same!
									</small>
								</div>
							)}
							<ScoreEditButtons
								score={score}
								scoreState={{ ...scoreState, comment, setComment }}
							/>
						</>
					) : (
						<div className="col-12 align-self-end">
							{forceScoreData && !showSingleScoreNote && (
								<ScoreInfo score={score} chart={chart} />
							)}
							<CommentContainer
								comment={pbData.scores
									.map(e => e.comment)
									.filter(e => e !== null)
									.join("; ")}
							/>
							<PBNote />
						</div>
					)}
				</div>
			</div>
			<div className="col-3 align-self-center">
				<JudgementTable score={score} />
			</div>
		</>
	);
}
