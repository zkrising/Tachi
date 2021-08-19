import DeltaCell from "components/tables/cells/DeltaCell";
import LampCell from "components/tables/cells/LampCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import TimestampCell from "components/tables/cells/TimestampCell";
import React, { useEffect, useState } from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { SetState } from "types/react";
import { IsScore } from "util/asserts";
import CommentContainer from "./CommentContainer";
import JudgementTable from "./JudgementTable";
import PBNote from "./PBNote";
import ScoreEditButtons from "./ScoreEditButtons";

export function ScoreInfo({ score }: { score: ScoreDocument }) {
	return (
		<div className="col-12">
			<table className="table">
				<thead>
					<tr>
						<td colSpan={100}>Score Info</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<ScoreCell score={score} game={score.game} playtype={score.playtype} />
						<DeltaCell
							game={score.game}
							playtype={score.playtype}
							score={score.scoreData.score}
							percent={score.scoreData.percent}
							grade={score.scoreData.grade}
						/>
						<LampCell sc={score} />
						<TimestampCell time={score.timeAchieved} />
					</tr>
				</tbody>
			</table>
		</div>
	);
}

export default function GenericScoreContentDropdown({
	score,
	scoreState,
}: {
	score: ScoreDocument | PBScoreDocument;
	scoreState: { highlight: boolean; setHighlight: SetState<boolean> };
}) {
	const [comment, setComment] = useState(IsScore(score) ? score.comment : null);

	useEffect(() => {
		setComment(IsScore(score) ? score.comment : null);
	}, [score]);

	return (
		<>
			<div className="col-9">
				<div className="row">
					{IsScore(score) ? (
						<>
							<ScoreInfo score={score} />
							<CommentContainer comment={comment} />
							<ScoreEditButtons
								score={score}
								scoreState={{ ...scoreState, comment, setComment }}
							/>
						</>
					) : (
						<div className="col-12">
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
