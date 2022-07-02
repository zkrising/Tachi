import { APIFetchV1 } from "util/api";
import { SendErrorToast } from "util/toaster";
import ProfilePicture from "components/user/ProfilePicture";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Game, Playtype, PublicUserDocument } from "tachi-common";
import { GamePT, JustChildren } from "types/react";
import UserSelectModal from "components/util/modal/UserSelectModal";
import UserIcon from "components/util/UserIcon";
import Card from "components/layout/page/Card";
import { TachiConfig } from "lib/config";

export default function RivalsOverviewWrapper({
	reqUser,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
}) {
	const { data, isLoading, error } = useApiQuery<PublicUserDocument[]>(
		`/users/${reqUser.id}/games/${game}/${playtype}/rivals`
	);

	const { data: challengers, isLoading: cIsLoading, error: cError } = useApiQuery<
		PublicUserDocument[]
	>(`/users/${reqUser.id}/games/${game}/${playtype}/rivals/challengers`);

	if (error) {
		<ApiError error={error} />;
	}

	if (isLoading || !data) {
		return <Loading />;
	}

	if (cError) {
		<ApiError error={cError} />;
	}

	if (cIsLoading || !challengers) {
		return <Loading />;
	}

	return (
		<RivalsOverviewPage
			reqUser={reqUser}
			game={game}
			playtype={playtype}
			initialRivals={data}
			challengers={challengers}
		/>
	);
}

function RivalsOverviewPage({
	reqUser,
	game,
	playtype,
	initialRivals,
	challengers,
}: {
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
	initialRivals: Array<PublicUserDocument>;
	challengers: Array<PublicUserDocument>;
}) {
	const { user } = useContext(UserContext);

	const isRequestingUser = reqUser.id === user?.id;

	const [rivals, setRivals] = useState<Array<PublicUserDocument>>(initialRivals);
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (!isRequestingUser) {
			return;
		}

		APIFetchV1(
			`/users/${reqUser.id}/games/${game}/${playtype}/rivals`,
			{
				method: "PUT",
				body: JSON.stringify({
					rivalIDs: rivals.map(e => e.id),
				}),
				headers: {
					"Content-Type": "application/json",
				},
			},
			false,
			true
		);
	}, [rivals]);

	return (
		<>
			{isRequestingUser && (
				<>
					<Card header="About Rivals &amp; Challenges">
						By setting Rivals on this page, {TachiConfig.name} will restructure parts of
						the UI to tell you how your Rivals are doing.
						{game === "bms" && (
							<>
								<br />
								If you're using the beatoraja IR, your rivals will{" "}
								<b>automatically</b> work in game!
							</>
						)}
						<Divider />
						By rivalling a user, you also subscribe to their <b>challenges</b>. This is
						another {TachiConfig.name} feature that goes hand-in-hand with rivals!
						<br />
						You'll automatically be notified when they send out a new challenge, and you
						can track your challenges using the above buttons.
						<br />
						You can also send out challenges. All your Reverse Rivals (and anyone who
						rivals you in the future) will receive it.
						<br />
						Just click any PB of yours that you're proud of, and click{" "}
						<b>Set Challenge</b>!
					</Card>
					<Divider />
				</>
			)}

			<Card header={`${isRequestingUser ? "Your" : `${reqUser.username}'s`} Rivals`}>
				<Col xs={12} className="d-flex justify-content-center flex-wrap">
					{rivals.map(e => (
						<UserIcon key={e.id} user={e} game={game} playtype={playtype}>
							<Button
								variant="outline-danger"
								onClick={() => setRivals(rivals.filter(u => u.id !== e.id))}
							>
								<Icon type="trash" />
								Remove
							</Button>
						</UserIcon>
					))}
					{rivals.length === 0 && (
						<Muted>
							{isRequestingUser ? "You haven't" : `${reqUser.username} hasn't`} set
							any rivals.
						</Muted>
					)}
				</Col>

				{isRequestingUser && (
					<>
						<Col xs={12}>
							<Divider />
						</Col>
						<Col xs={12} className="d-flex justify-content-center">
							{rivals.length >= 5 ? (
								<Button variant="secondary" disabled>
									Maximum Rivals Reached :(
								</Button>
							) : (
								<Button onClick={() => setShow(true)} variant="success">
									<Icon type="plus" />
									Add Rival
								</Button>
							)}
						</Col>

						<UserSelectModal
							callback={user => {
								if (rivals.length >= 5) {
									SendErrorToast(`Can't have more than 5 rivals!`);
								} else {
									setRivals([...rivals, user]);
								}
							}}
							show={show}
							setShow={setShow}
							url={`/games/${game}/${playtype}/players`}
							excludeSet={rivals.map(e => e.id)}
						/>
					</>
				)}
			</Card>

			<Divider />

			<Card
				header={
					<div className="text-center">
						<h1>
							{isRequestingUser ? "Your" : `${reqUser.username}'s`} Reverse Rivals
						</h1>
						{challengers.length !== 0 && (
							<>
								<Muted>
									These people have {isRequestingUser ? "you" : reqUser.username}{" "}
									rivalled!
								</Muted>
							</>
						)}
					</div>
				}
			>
				<Col xs={12} className="d-flex justify-content-center flex-wrap">
					{challengers.map(e => (
						<UserIcon key={e.id} user={e} game={game} playtype={playtype}>
							{isRequestingUser &&
								!rivals.map(e => e.id).includes(e.id) &&
								(rivals.length < 5 ? (
									<Button
										variant="outline-success"
										onClick={() => setRivals([...rivals, e])}
									>
										<Icon type="plus" />
										Rival Back
									</Button>
								) : (
									<Button variant="outline-secondary" disabled>
										<Icon type="plus" />
										At Max Rivals
									</Button>
								))}
						</UserIcon>
					))}
					{challengers.length === 0 &&
						(isRequestingUser ? (
							<Muted>
								Nobody is rivalling you :(. Why not ask around in the discord?
							</Muted>
						) : (
							<Muted>This user has nobody rivalling them :(</Muted>
						))}
				</Col>
			</Card>
		</>
	);
}
