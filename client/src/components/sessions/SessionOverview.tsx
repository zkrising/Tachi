import { FormatGPTSessionRatingName, FormatSessionRating, UppercaseFirst } from "util/misc";
import { FormatDuration } from "util/time";
import Card from "components/layout/page/Card";
import ScoreTable from "components/tables/scores/ScoreTable";
import Divider from "components/util/Divider";
import React, { useEffect, useState } from "react";
import { Badge, Col, Row } from "react-bootstrap";
import {
	AnySessionRatingAlg,
	GetGamePTConfig,
	GetGPTString,
	PBScoreDocument,
	ScoreDocument,
	SessionDocument,
	UserDocument,
} from "tachi-common";
import { SessionReturns } from "types/api-returns";
import { ScoreDataset } from "types/tables";
import { SetState } from "types/react";
import SelectLinkButton from "components/util/SelectLinkButton";
import Icon from "components/util/Icon";
import useUGPTBase from "components/util/useUGPTBase";
import { Route, Switch } from "react-router-dom";
import useApiQuery from "components/util/query/useApiQuery";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import SessionFolderRaiseBreakdown from "./SessionFolderRaiseBreakdown";
import SessionRaiseBreakdown from "./SessionRaiseBreakdown";

type PBsData = { pbs: Array<PBScoreDocument> };

export default function SessionOverview({
	sessionData,
	setSessionData,
	scoreDataset,
	reqUser,
}: {
	sessionData: SessionReturns;
	setSessionData: SetState<SessionReturns>;
	scoreDataset: ScoreDataset;
	reqUser: UserDocument;
}) {
	const { scores, session } = sessionData;
	const gptConfig = GetGamePTConfig(session.game, session.playtype);
	const gptImpl = GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(session.game, session.playtype)];
	const MAX_SCORES = gptImpl.sessionImportantScoreCount;

	const setScores = (scores: ScoreDocument[]) => {
		setSessionData({
			...sessionData,
			scores,
		});
	};

	const [importantScores, setImportantScores] = useState<null | ScoreDataset>(null);

	const scoreRatingAlgsKeys = Object.keys(gptConfig.scoreRatingAlgs);

	const query =
		scoreRatingAlgsKeys.length === 1
			? `/users/${reqUser.id}/games/${session.game}/${session.playtype}/pbs/best?alg=${scoreRatingAlgsKeys[0]}`
			: scoreRatingAlgsKeys.map(
					(alg) =>
						`/users/${reqUser.id}/games/${session.game}/${session.playtype}/pbs/best?alg=${alg}`
			  );

	const { data } = useApiQuery<PBsData | PBsData[]>(query);

	useEffect(() => {
		if (!data) {
			setImportantScores(null);
			return;
		}

		const important: Array<string> = [];

		const findImportant = (data: PBsData) => {
			for (const pb of data.pbs.slice(0, MAX_SCORES)) {
				const didFind = pb.composedFrom.find((e) => session.scoreIDs.includes(e.scoreID));

				if (didFind) {
					important.push(didFind.scoreID);
				}
			}
		};

		if (Array.isArray(data)) {
			for (const d of data) {
				findImportant(d);
			}
		} else {
			findImportant(data);
		}

		setImportantScores(scoreDataset.filter((e) => important.includes(e.scoreID)));
	}, [data]);

	const base = useUGPTBase({ game: session.game, playtype: session.playtype, reqUser });
	const baseUrl = `${base}/sessions/${session.sessionID}`;

	const highlightedScores = scoreDataset.filter((e) => e.highlight);

	return (
		<>
			<Row xs={{ cols: 1 }} lg={{ cols: 3 }} className="p-0 row-gap-4">
				<StatThing name="Scores" value={session.scoreIDs.length} />
				<StatThing
					name="Duration"
					value={FormatDuration(session.timeEnded - session.timeStarted)}
				/>
				<StatThing name="Highlights" value={scores.filter((e) => e.highlight).length} />
			</Row>

			<div className="p-4">
				<RatingsOverview session={session} />
			</div>

			<Row xs={12}>
				<Divider />

				<Col className="text-center">
					<div className="btn-group d-flex justify-content-center mb-4">
						<SelectLinkButton to={`${baseUrl}`}>
							<Icon type="chart-line" /> Raises
						</SelectLinkButton>
						<SelectLinkButton to={`${baseUrl}/folders`}>
							<Icon type="sort-numeric-up-alt" /> Folder Stats
						</SelectLinkButton>
						<SelectLinkButton to={`${baseUrl}/important`}>
							<Icon type="star" /> Important Scores{" "}
							{importantScores && importantScores.length > 0 && (
								<Badge style={{ marginLeft: "5px" }} bg="primary">
									{importantScores.length} new top {MAX_SCORES}
									{importantScores.length === 1 ? "" : "s"}!
								</Badge>
							)}
						</SelectLinkButton>
						<SelectLinkButton to={`${baseUrl}/scores`}>
							<Icon type="database" /> All Scores
						</SelectLinkButton>
					</div>
				</Col>
			</Row>

			<Col xs={12}>
				<Divider />
			</Col>

			<Col xs={12}>
				<Switch>
					<Route exact path="/u/:userID/games/:game/:playtype/sessions/:sessionID">
						<Card header="Raise Breakdown">
							<Row>
								<SessionRaiseBreakdown
									sessionData={sessionData}
									setScores={setScores}
								/>
							</Row>
						</Card>
					</Route>

					<Route
						exact
						path="/u/:userID/games/:game/:playtype/sessions/:sessionID/folders"
					>
						<SessionFolderRaiseBreakdown sessionData={sessionData} />
					</Route>

					<Route
						exact
						path="/u/:userID/games/:game/:playtype/sessions/:sessionID/important"
					>
						{importantScores && importantScores.length > 0 && (
							<Card header={`Scores in ${reqUser.username}'s top ${MAX_SCORES}!`}>
								<ScoreTable
									game={session.game}
									playtype={session.playtype}
									dataset={importantScores}
								/>
							</Card>
						)}
						{importantScores &&
							importantScores?.length > 0 &&
							highlightedScores.length > 0 && <Divider />}
						<Card header="Highlighted Scores">
							<ScoreTable
								game={session.game}
								playtype={session.playtype}
								dataset={highlightedScores}
							/>
						</Card>
					</Route>

					<Route exact path="/u/:userID/games/:game/:playtype/sessions/:sessionID/scores">
						<ScoreTable
							dataset={scoreDataset}
							game={session.game}
							playtype={session.playtype}
							onScoreUpdate={(sc) => {
								const newScores = [
									...sessionData.scores.filter((e) => e.scoreID !== sc.scoreID),
									sc,
								];

								setSessionData({
									...sessionData,
									scores: newScores,
								});
							}}
						/>
					</Route>
				</Switch>
			</Col>
		</>
	);
}

// Temporarily shoved to the bottom, as it needs to be significantly improved,
// but we can't really just remove it lol.
function RatingsOverview({ session }: { session: SessionDocument }) {
	const gptConfig = GetGamePTConfig(session.game, session.playtype);

	function Thing({ value, name }: { value: string | number; name: string }) {
		return (
			<div className="d-flex" style={{ flexGrow: 1 }}>
				<div className="card" style={{ flexGrow: 1 }}>
					<div className="card-body">
						<div className="display-4">{value}</div>
						<div style={{ fontSize: "1.2rem" }}>{name}</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="d-flex text-center" style={{ justifyContent: "space-evenly", gap: "1rem" }}>
			{Object.keys(gptConfig.sessionRatingAlgs).map((e) => (
				<Thing
					key={e}
					name={`Average ${FormatGPTSessionRatingName(
						session.game,
						session.playtype,
						e
					)}`}
					value={FormatSessionRating(
						session.game,
						session.playtype,
						e as AnySessionRatingAlg,
						session.calculatedData[e as AnySessionRatingAlg]
					)}
				/>
			))}
		</div>
	);
}

function StatThing({ value, name }: { value: string | number; name: string }) {
	return (
		<Col>
			<div className="card">
				<div className="card-body">
					<div className="display-4">{value}</div>
					<div style={{ fontSize: "1.2rem" }}>{name}</div>
				</div>
			</div>
		</Col>
	);
}
