import React from "react";
import { FormatGame, PublicUserDocument, UserGameStats } from "tachi-common";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import ReactMarkdown from "react-markdown";
import { UserContext } from "context/UserContext";
import { Button } from "react-bootstrap";
import { APIFetchV1 } from "util/api";
import Divider from "components/util/Divider";
import Muted from "components/util/Muted";
import ExternalLink from "components/util/ExternalLink";
import AsyncLoader from "components/util/AsyncLoader";
import UGPTRatingsTable from "components/user/UGPTStatsOverview";
import LinkButton from "components/util/LinkButton";
import { UGSWithRankingData } from "types/api-returns";
import RankingData, { LazyRankingData } from "components/user/UGPTRankingData";
import ReferToUser from "components/util/ReferToUser";

interface Props {
	reqUser: PublicUserDocument;
}

export default function UserGamesPage({ reqUser }: Props) {
	useSetSubheader(
		["Users", reqUser.username, "Games"],
		[reqUser],
		`${reqUser.username}'s Game Profiles`
	);

	return (
		<div className="row">
			<AsyncLoader
				promiseFn={async () => {
					const res = await APIFetchV1<UGSWithRankingData[]>(
						`/users/${reqUser.id}/game-stats`
					);

					if (!res.success) {
						throw new Error(res.description);
					}

					return res.body;
				}}
			>
				{ugs =>
					ugs.length ? (
						ugs.map((e, i) => {
							// uses modulo to determine whether we're on the
							// last row or not
							// to do sizing like [12] or [6][6] instead of [3][3][3]
							let mdSize = "6";
							let lgSize = "4";
							if (ugs.length - i <= ugs.length % 3) {
								lgSize = (12 / (ugs.length % 3)).toString();
							}

							if (ugs.length - i <= ugs.length % 2) {
								mdSize = (12 / (ugs.length % 2)).toString();
							}

							return (
								<div
									className={`col-12 col-md-${mdSize} col-lg-${lgSize}`}
									key={`${e.game}:${e.playtype}`}
								>
									<GameStatContainer ugs={e} reqUser={reqUser} />
								</div>
							);
						})
					) : (
						<div className="col-12 text-center">
							<Muted>
								<ReferToUser reqUser={reqUser} /> not played anything.
							</Muted>
						</div>
					)
				}
			</AsyncLoader>
		</div>
	);
}

function GameStatContainer({ ugs, reqUser }: { ugs: UGSWithRankingData } & Props) {
	return (
		<Card
			className="mb-4"
			footer={
				<div className="d-flex justify-content-end">
					<LinkButton
						to={`/dashboard/users/${reqUser.username}/games/${ugs.game}/${ugs.playtype}`}
					>
						View Game Profile
					</LinkButton>
				</div>
			}
			header={FormatGame(ugs.game, ugs.playtype)}
		>
			<UGPTRatingsTable ugs={ugs} />
			<RankingData game={ugs.game} playtype={ugs.playtype} rankingData={ugs.__rankingData} />
		</Card>
	);
}
