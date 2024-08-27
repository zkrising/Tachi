import { GetSortedGPTs } from "util/site";
import Muted from "components/util/Muted";
import ReferToUser from "components/util/ReferToUser";
import React, { memo, useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { FormatGame, UserDocument, UserGameStats } from "tachi-common";
import { UGSWithRankingData } from "types/api-returns";
import LinkButton from "components/util/LinkButton";
import Card from "components/layout/page/Card";
import { UserContext } from "context/UserContext";
import { AllLUGPTStatsContext } from "context/AllLUGPTStatsContext";
import useApiQuery from "components/util/query/useApiQuery";
import LoadingWrapper from "components/util/LoadingWrapper";
import UGPTRatingsTable from "./UGPTStatsOverview";
import RankingData from "./UGPTRankingData";

interface GamesInfoProps {
	ugsList: UserGameStats[];
	reqUser: UserDocument;
}

interface GamesInfoUnitProps {
	ugs: UGSWithRankingData;
	reqUser: UserDocument;
}

export default function UGPTProfiles({ reqUser }: { reqUser?: UserDocument }) {
	const { user } = useContext(UserContext);

	return (
		<Row xs={{ cols: 1 }} lg={{ cols: 2 }}>
			{/*
                If a user is logged in and the component hasn't been provided reqUser or this is the logged in user's stats,
                we can just grab the user's stats that have already been loaded into context on load.
            */}
			{user && (!reqUser || reqUser.id === user.id) ? (
				<ContextualGamesInfo user={user} />
			) : reqUser ? (
				<QueryGamesInfo reqUser={reqUser} />
			) : (
				<>User not provided; can't show games for nobody!</>
			)}
		</Row>
	);
}

const ContextualGamesInfo = memo(({ user }: { user: UserDocument }) => {
	const { ugs } = useContext(AllLUGPTStatsContext);

	return <GamesInfo ugsList={ugs ?? []} reqUser={user} />;
});

function QueryGamesInfo({ reqUser }: { reqUser: UserDocument }) {
	const { data, error } = useApiQuery<UGSWithRankingData[]>(
		`/users/${reqUser.id}/game-stats`,
		undefined,
		undefined,
		!reqUser
	);

	if (error) {
		throw new Error("An error occurred fetching User Game Stats.", { cause: error });
	}

	return (
		<LoadingWrapper error={error} dataset={data}>
			<GamesInfo ugsList={data!} reqUser={reqUser} />
		</LoadingWrapper>
	);
}

function GamesInfo({ ugsList, reqUser }: GamesInfoProps) {
	if (ugsList.length === 0) {
		return (
			<div className="col-12 text-center">
				<Muted>
					<ReferToUser reqUser={reqUser} /> not played anything.
				</Muted>
			</div>
		);
	}

	const gpts = GetSortedGPTs();

	const ugsMap = new Map();

	for (const ugs of ugsList) {
		ugsMap.set(`${ugs.game}:${ugs.playtype}`, ugs);
	}

	return (
		<>
			{gpts.map(({ game, playtype }) => {
				const e = ugsMap.get(`${game}:${playtype}`);

				if (!e) {
					return null;
				}

				return <GamesInfoUnit key={`${game}:${playtype}`} ugs={e} reqUser={reqUser} />;
			})}
		</>
	);
}

function GamesInfoUnit({ ugs, reqUser }: GamesInfoUnitProps) {
	return (
		<Col className="p-2 flex-grow-1">
			<Card
				className="h-100"
				footer={
					<div className="d-flex justify-content-end">
						<LinkButton to={`/u/${reqUser.username}/games/${ugs.game}/${ugs.playtype}`}>
							View Game Profile
						</LinkButton>
					</div>
				}
				header={FormatGame(ugs.game, ugs.playtype)}
			>
				<UGPTRatingsTable ugs={ugs} />
				<RankingData
					game={ugs.game}
					playtype={ugs.playtype}
					rankingData={ugs.__rankingData}
					userID={ugs.userID}
				/>
			</Card>
		</Col>
	);
}
