import { FormatSessionRating, UppercaseFirst } from "util/misc";
import { FormatDuration } from "util/time";
import Card from "components/layout/page/Card";
import ScoreTable from "components/tables/scores/ScoreTable";
import Divider from "components/util/Divider";
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { GetGamePTConfig, ScoreDocument, SessionDocument } from "tachi-common";
import { SessionReturns } from "types/api-returns";
import { ScoreDataset } from "types/tables";
import { SetState } from "types/react";
import SessionRaiseBreakdown from "./SessionRaiseBreakdown";

export default function SessionOverview({
	sessionData,
	setSessionData,
	scoreDataset,
}: {
	sessionData: SessionReturns;
	setSessionData: SetState<SessionReturns>;
	scoreDataset: ScoreDataset;
}) {
	const { scores, session } = sessionData;

	const setScores = (scores: ScoreDocument[]) => {
		setSessionData({
			...sessionData,
			scores,
		});
	};

	return (
		<>
			<StatThing name="Scores" value={session.scoreInfo.length} />
			<StatThing
				name="Duration"
				value={FormatDuration(session.timeEnded - session.timeStarted)}
			/>
			<StatThing md12 name="Highlights" value={scores.filter((e) => e.highlight).length} />
			<Col xs={12}>
				<Divider />

				<Card header="Raise Breakdown">
					<Row>
						<SessionRaiseBreakdown sessionData={sessionData} setScores={setScores} />
					</Row>
				</Card>
			</Col>
			<Col xs={12}>
				<Divider />
				<Card header="Highlights">
					<ScoreTable
						game={session.game}
						playtype={session.playtype}
						dataset={scoreDataset.filter((e) => e.highlight)}
					/>
				</Card>
			</Col>
			<RatingsOverview session={session} />
		</>
	);
}

// Temporarily shoved to the bottom, as it needs to be significantly improved,
// but we can't really just remove it lol.
function RatingsOverview({ session }: { session: SessionDocument }) {
	const gptConfig = GetGamePTConfig(session.game, session.playtype);

	return (
		<Col xs={12}>
			<Divider />
			<Card header="Ratings">
				<div className="d-flex text-center" style={{ justifyContent: "space-evenly" }}>
					{gptConfig.sessionRatingAlgs.map((e) => (
						<div key={e}>
							<div className="display-4">{UppercaseFirst(e)}</div>
							<div style={{ fontSize: "1.2rem" }}>
								{FormatSessionRating(
									session.game,
									session.playtype,
									e,
									session.calculatedData[e]
								)}
							</div>
						</div>
					))}
				</div>
			</Card>
		</Col>
	);
}

function StatThing({
	value,
	name,
	md12,
}: {
	value: string | number;
	name: string;
	md12?: boolean;
}) {
	return (
		<Col xs={12} md={md12 ? 12 : 6} lg={4}>
			<div className="card">
				<div className="card-body">
					<div className="display-4">{value}</div>
					<div style={{ fontSize: "1.2rem" }}>{name}</div>
				</div>
			</div>
		</Col>
	);
}
