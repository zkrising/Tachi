import { CreateSongMap } from "util/data";
import Card from "components/layout/page/Card";
import ComparePBsTable from "components/tables/rivals/ComparePBsTable";
import ProfilePicture from "components/user/ProfilePicture";
import UGPTRatingsTable from "components/user/UGPTStatsOverview";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import React, { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PublicUserDocument } from "tachi-common";
import { BestPBsUnion, UGPTStatsReturn } from "types/api-returns";
import { GamePT } from "types/react";
import { ComparePBsDataset } from "types/tables";

export default function RivalCompareBestPBsPage({
	reqUser,
	game,
	playtype,
}: GamePT & {
	reqUser: PublicUserDocument;
}) {
	const { settings } = useLUGPTSettings();

	if (!settings) {
		return <div>You have no settings. How did you get here?</div>;
	}

	const [selectedUser, setSelectedUser] = useState<string | null>(null);

	const { data, error } = useApiQuery<Array<PublicUserDocument>>(
		`/users/${reqUser.id}/games/${game}/${playtype}/rivals`,
		undefined,
		[settings.rivals.join(",")]
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	return (
		<div>
			<Card header="Rival Select">
				<Form.Control
					as="select"
					value={selectedUser ?? ""}
					onChange={(e) => setSelectedUser(e.target.value || null)}
				>
					<option value="">Please Select...</option>
					{data.map((e) => (
						<option key={e.username} value={e.username}>
							{e.username}
						</option>
					))}
				</Form.Control>
				<div className="form-text">Select a rival to compare against.</div>
			</Card>
			{selectedUser !== null && (
				<>
					<Divider />
					<RivalBestPBsCompare
						reqUser={reqUser}
						game={game}
						playtype={playtype}
						withUser={selectedUser}
					/>
				</>
			)}
		</div>
	);
}

function RivalBestPBsCompare({
	reqUser,
	game,
	playtype,
	withUser,
}: {
	reqUser: PublicUserDocument;
	withUser: string;
} & GamePT) {
	const { data, error } = useApiQuery<BestPBsUnion>(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best-union?withUser=${withUser}&limit=250`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const basePBLookup = new Map(data.baseUserPBs.map((e) => [e.chartID, e]));
	const comparePBLookup = new Map(data.withUserPBs.map((e) => [e.chartID, e]));

	const songMap = CreateSongMap(data.songs);

	const dataset: ComparePBsDataset = data.charts.map((chart) => ({
		chart,
		base: basePBLookup.get(chart.chartID) ?? null,
		compare: comparePBLookup.get(chart.chartID) ?? null,
		song: songMap.get(chart.songID)!,
	}));

	return (
		<Row>
			<UserCard username={reqUser.username} game={game} playtype={playtype} />
			<UserCard username={withUser} game={game} playtype={playtype} />
			<Col xs={12}>
				<Divider />
			</Col>
			<ComparePBsTable
				baseUser={reqUser.username}
				compareUser={withUser}
				dataset={dataset}
				game={game}
				playtype={playtype}
			/>
		</Row>
	);
}

function UserCard({ username, game, playtype }: { username: string } & GamePT) {
	const { data, error } = useApiQuery<UGPTStatsReturn>(
		`/users/${username}/games/${game}/${playtype}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	return (
		<Col xs={12} lg={6}>
			<Card>
				<Row className="align-items-center">
					<Col lg={3}>
						<ProfilePicture user={username} />
					</Col>
					<Col lg={3}>
						<h4>
							<Link
								className="gentle-link"
								to={`/dashboard/users/${username}/games/${game}/${playtype}`}
							>
								{username}
							</Link>
						</h4>
					</Col>
					<Col lg={6}>
						{data ? <UGPTRatingsTable ugs={data.gameStats} /> : <Loading />}
					</Col>
				</Row>
			</Card>
		</Col>
	);
}
