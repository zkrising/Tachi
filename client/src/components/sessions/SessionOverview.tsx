import { FormatDuration } from "util/time";
import Card from "components/layout/page/Card";
import ScoreTable from "components/tables/scores/ScoreTable";
import Divider from "components/util/Divider";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Col } from "react-bootstrap";
import { SessionReturns } from "types/api-returns";
import { ScoreDataset } from "types/tables";

export default function SessionOverview({
	sessionData,
	scoreDataset,
}: {
	sessionData: SessionReturns;
	scoreDataset: ScoreDataset;
}) {
	const { scores, session } = sessionData;
	const { user } = useContext(UserContext);

	return (
		<>
			<StatThing name="Scores" value={session.scoreInfo.length} />
			<StatThing
				name="Duration"
				value={FormatDuration(session.timeEnded - session.timeStarted)}
			/>
			<StatThing md12 name="Highlights" value={scores.filter(e => e.highlight).length} />
			<Col xs={12}>
				<Divider />
				<Card header="Highlights">
					<ScoreTable
						game={session.game}
						playtype={session.playtype}
						dataset={scoreDataset.filter(e => e.highlight)}
					/>
				</Card>
			</Col>
		</>
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
