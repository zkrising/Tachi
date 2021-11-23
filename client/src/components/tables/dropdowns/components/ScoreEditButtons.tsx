import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import { UserContext } from "context/UserContext";
import React, { useContext, useState } from "react";
import { Game, ScoreDocument } from "tachi-common";
import { Button, Modal, Form } from "react-bootstrap";
import { SetState } from "types/react";
import { APIFetchV1 } from "util/api";
import LinkButton from "components/util/LinkButton";
import ExternalLink from "components/util/ExternalLink";
import ImgScoreButton from "./ImgScoreButton";

export default function ScoreEditButtons({
	score,
	scoreState,
}: {
	score: ScoreDocument;
	scoreState: {
		highlight: boolean;
		comment: string | null;
		setHighlight: SetState<boolean>;
		setComment: SetState<string | null>;
	};
}) {
	const { user } = useContext(UserContext);

	const { highlight, setHighlight, comment, setComment } = scoreState;

	const [show, setShow] = useState(false);

	return (
		<div className="mt-4 d-flex w-100 justify-content-center">
			<div className="btn-group">
				{!user ||
					(user.id !== score.userID && (
						<>
							{comment ? (
								<>
									<QuickTooltip tooltipContent="Edit your comment on this score.">
										<Button
											variant="outline-secondary"
											onClick={() => setShow(true)}
										>
											<Icon noPad type="file-signature" />
										</Button>
									</QuickTooltip>
								</>
							) : (
								<QuickTooltip tooltipContent="Comment on this score.">
									<Button
										variant="outline-secondary"
										onClick={() => setShow(true)}
									>
										<Icon noPad type="file-signature" />
									</Button>
								</QuickTooltip>
							)}

							{highlight ? (
								<QuickTooltip tooltipContent="Unhighlight this score.">
									<Button
										variant="success"
										onClick={() =>
											ModifyScore(score.scoreID, { highlight: false }).then(
												r => {
													if (r) {
														setHighlight(false);
														score.highlight = false;
													}
												}
											)
										}
									>
										<Icon noPad type="star" />
									</Button>
								</QuickTooltip>
							) : (
								<QuickTooltip tooltipContent="Highlight this score.">
									<Button
										variant="outline-secondary"
										onClick={() =>
											ModifyScore(score.scoreID, { highlight: true }).then(
												r => {
													if (r) {
														setHighlight(true);
														score.highlight = true;
													}
												}
											)
										}
									>
										<Icon noPad type="star" />
									</Button>
								</QuickTooltip>
							)}
						</>
					))}

				<ImgScoreButton score={score} />
			</div>
			<CommentModal
				show={show}
				setShow={setShow}
				comment={comment}
				setComment={setComment}
				scoreID={score.scoreID}
				score={score}
			/>
		</div>
	);
}

async function ModifyScore(
	scoreID: string,
	content: { comment?: string | null; highlight?: boolean }
) {
	const res = await APIFetchV1(
		`/scores/${scoreID}`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(content),
		},
		true,
		true
	);

	return res.success;
}

function CommentModal({
	show,
	setShow,
	comment,
	setComment,
	scoreID,
	score,
}: {
	show: boolean;
	setShow: SetState<boolean>;
	comment: string | null;
	setComment: SetState<string | null>;
	scoreID: string;
	score: ScoreDocument;
}) {
	const [innerComment, setInnerComment] = useState(comment ?? "");

	return (
		<Modal show={show} onHide={() => setShow(false)}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Comment</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form
					onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
						e.preventDefault();

						ModifyScore(scoreID, { comment: innerComment }).then(r => {
							if (r) {
								setComment(innerComment);
								score.comment = innerComment;
								setShow(false);
							}
						});
					}}
				>
					<Form.Group>
						<div className="input-group">
							<input
								className="form-control form-control-lg"
								type="text"
								placeholder={comment ?? "This score was great!"}
								value={innerComment}
								onChange={e => setInnerComment(e.target.value)}
							/>
							<div className="input-group-append">
								<Button variant="primary" type="submit">
									Submit
								</Button>
							</div>
						</div>
					</Form.Group>

					<QuickTooltip tooltipContent="Remove your comment on this score.">
						<Button
							variant="outline-danger"
							onClick={() =>
								ModifyScore(scoreID, { comment: null }).then(r => {
									if (r) {
										setComment(null);
										score.comment = null;
										setShow(false);
									}
								})
							}
						>
							<Icon noPad type="trash" />
						</Button>
					</QuickTooltip>
				</Form>
			</Modal.Body>
		</Modal>
	);
}
