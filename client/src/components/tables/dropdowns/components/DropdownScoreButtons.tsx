import { IsScore } from "util/asserts";
import React, { useEffect, useState } from "react";
import { ScoreDropdownProps } from "../PBDropdown";
import CommentContainer from "./CommentContainer";
import { ScoreInfo } from "./DocumentComponent";
import PBNote from "./PBNote";
import ScoreEditButtons from "./ScoreEditButtons";

export default function DropdownScoreButtons({
	score,
	scoreState,
	pbData,
	chart,
}: ScoreDropdownProps) {
	const [comment, setComment] = useState(IsScore(score) ? score.comment : null);

	useEffect(() => {
		setComment(IsScore(score) ? score.comment : null);
	}, [score]);

	return (
		<>
			{IsScore(score) ? (
				<>
					<ScoreInfo score={score} chart={chart} />
					<CommentContainer comment={comment} />
					<ScoreEditButtons
						score={score}
						scoreState={{ ...scoreState, comment, setComment }}
					/>
				</>
			) : (
				<div className="col-12">
					<CommentContainer
						comment={pbData.scores
							.map(e => e.comment)
							.filter(e => e !== null)
							.join("; ")}
					/>
					<PBNote />
				</div>
			)}
		</>
	);
}
