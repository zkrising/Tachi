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
import React, { useContext, useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Stack from "react-bootstrap/Stack";
import { Link } from "react-router-dom";
import { COLOUR_SET, FolderDocument, GetGamePTConfig, UserDocument } from "tachi-common";
import { UGPTFolderReturns, UGPTStatsReturn } from "types/api-returns";
import { GamePT } from "types/react";
import { ComparePBsDataset } from "types/tables";
import UserSelectModal from "components/util/modal/UserSelectModal";
import UserIcon from "components/util/UserIcon";
import { UserContext } from "context/UserContext";
import MiniTable from "components/tables/components/MiniTable";

export default function RivalCompareFolderPage({
	reqUser,
	game,
	playtype,
	folder,
}: GamePT & {
	reqUser: UserDocument;
	folder: FolderDocument;
}) {
	const { settings } = useLUGPTSettings();
	const { user } = useContext(UserContext);

	const [selectedUser, setSelectedUser] = useState<UserDocument | null>(null);
	const [show, setShow] = useState(false);

	// honestly don't care if this errors or not
	const { data, error } = useApiQuery<Array<UserDocument>>(
		`/users/${settings?.userID}/games/${game}/${playtype}/rivals`,
		undefined
		// [settings?.rivals.join(",")]
	);

	if (!data && !error) {
		return <Loading />;
	}

	let suggestUsers = data ?? [];

	// if the user viewing this page is logged in and *is not*
	// the person this page is for
	// show them in the suggestions.
	if (user && user.id !== reqUser.id && data) {
		suggestUsers = [...suggestUsers, user];
	}

	return (
		<div>
			<Card header="Pick a user to compare against...">
				{suggestUsers.length > 0 && (
					<>
						<Col xs={12} className="d-flex justify-content-center flex-wrap">
							{suggestUsers.map((e) => (
								<UserIcon key={e.id} user={e} game={game} playtype={playtype}>
									<Button
										variant={
											selectedUser?.id === e.id ? "secondary" : "primary"
										}
										onClick={() => setSelectedUser(e)}
									>
										Compare Against
									</Button>
								</UserIcon>
							))}
						</Col>

						<Divider />
					</>
				)}

				<UserSelectModal
					callback={(user) => {
						setSelectedUser(user);
						setShow(false);
					}}
					show={show}
					setShow={setShow}
					url={`/games/${game}/${playtype}/players`}
					excludeSet={[reqUser.id]}
					excludeMsg="Can't pick the same user!"
				/>
				<Button
					className={suggestUsers.length === 0 ? "d-flex mx-auto" : ""}
					variant={selectedUser ? "secondary" : "primary"}
					onClick={() => setShow(true)}
				>
					Pick{suggestUsers.length > 0 ? " Other" : ""} User
				</Button>
			</Card>
			{selectedUser !== null && folder !== null && (
				<>
					<Divider />
					<FolderCompare
						reqUser={reqUser}
						game={game}
						playtype={playtype}
						withUser={selectedUser}
						folder={folder}
					/>
				</>
			)}
		</div>
	);
}

function FolderCompare({
	reqUser,
	game,
	playtype,
	withUser,
	folder,
}: {
	reqUser: UserDocument;
	withUser: UserDocument;
	folder: FolderDocument;
} & GamePT) {
	const { data: baseData, error: baseError } = useApiQuery<UGPTFolderReturns>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folder.folderID}`
	);

	const { data: compareData, error: compareError } = useApiQuery<UGPTFolderReturns>(
		`/users/${withUser.id}/games/${game}/${playtype}/folders/${folder.folderID}`
	);

	const [shouldIncludeNotPlayed, setShouldIncludeNotPlayed] = useState(false);

	const dataset = useMemo(() => {
		// i *LOVE* the rules of hooks! they're so convenient!
		if (!baseData || !compareData) {
			return [];
		}

		const basePBLookup = new Map(baseData.pbs.map((e) => [e.chartID, e]));
		const comparePBLookup = new Map(compareData.pbs.map((e) => [e.chartID, e]));

		const songMap = CreateSongMap(baseData.songs);

		let ds: ComparePBsDataset = baseData.charts.map((chart) => ({
			chart,
			base: basePBLookup.get(chart.chartID) ?? null,
			compare: comparePBLookup.get(chart.chartID) ?? null,
			song: songMap.get(chart.songID)!,
		}));

		if (!shouldIncludeNotPlayed) {
			ds = ds.filter((e) => e.base && e.compare);
		}

		return ds;
	}, [shouldIncludeNotPlayed, baseData, compareData]);

	if (baseError) {
		return <ApiError error={baseError} />;
	}
	if (compareError) {
		return <ApiError error={compareError} />;
	}

	if (!compareData || !baseData) {
		return <Loading />;
	}

	return (
		<Stack gap={4}>
			<Row xs={{ cols: 1 }} lg={{ cols: 2 }}>
				<UserCard user={reqUser} game={game} playtype={playtype} />
				<UserCard user={withUser} game={game} playtype={playtype} />
			</Row>
			{/* <CompareCard
				dataset={dataset}
				baseUsername={reqUser.username}
				otherUsername={withUser.username}
			/> */}
			<Form.Check
				checked={shouldIncludeNotPlayed}
				onChange={() => setShouldIncludeNotPlayed(!shouldIncludeNotPlayed)}
				label="Include charts without plays?"
			/>
			<hr className="m-0" />
			<ComparePBsTable
				baseUser={reqUser.username}
				compareUser={withUser.username}
				dataset={dataset}
				game={game}
				playtype={playtype}
			/>
		</Stack>
	);
}

function UserCard({ user, game, playtype }: { user: UserDocument } & GamePT) {
	const { data, error } = useApiQuery<UGPTStatsReturn>(
		`/users/${user.username}/games/${game}/${playtype}`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	return (
		<Col className="d-grid">
			<Card cardBodyClassName="d-flex flex-column gap-4 flex-lg-row align-items-center justify-content-between">
				<div className="d-flex flex-column">
					<Link
						className="fw-bold fs-4 text-center text-lg-start"
						to={`/u/${user.username}/games/${game}/${playtype}`}
					>
						{user.username}
					</Link>
					<ProfilePicture user={user} />
				</div>
				<Col xs={12} sm={6} lg={7} xl={6}>
					{data ? <UGPTRatingsTable ugs={data.gameStats} /> : <Loading />}
				</Col>
			</Card>
		</Col>
	);
}
