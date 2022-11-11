import { APIFetchV1 } from "util/api";
import { SendErrorToast } from "util/toaster";
import { ChangeOpacity } from "util/color-opacity";
import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import UserSelectModal from "components/util/modal/UserSelectModal";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import UserIcon from "components/util/UserIcon";
import { UserContext } from "context/UserContext";
import React, { useContext, useState } from "react";
import { Alert, Button, Col } from "react-bootstrap";
import { COLOUR_SET, FormatGame, Game, GetGameConfig, Playtype, UserDocument } from "tachi-common";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import useSetSubheader from "components/layout/header/useSetSubheader";

export default function RivalsManagePage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: UserDocument;
	game: Game;
	playtype: Playtype;
}) {
	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Rivals", "Manage"],
		[reqUser, game, playtype],
		`Managing ${reqUser.username}'s ${FormatGame(game, playtype)} Rivals`
	);

	const { settings } = useLUGPTSettings();

	const { data, error } = useApiQuery<UserDocument[]>(
		`/users/${reqUser.id}/games/${game}/${playtype}/rivals`,
		{},
		[`fetch-rivals-${settings?.rivals.join(",")}`]
	);

	const {
		data: challengers,
		isLoading: cIsLoading,
		error: cError,
	} = useApiQuery<UserDocument[]>(
		`/users/${reqUser.id}/games/${game}/${playtype}/rivals/challengers`
	);

	if (error) {
		<ApiError error={error} />;
	}

	if (!data) {
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
	reqUser: UserDocument;
	game: Game;
	playtype: Playtype;
	initialRivals: Array<UserDocument>;
	challengers: Array<UserDocument>;
}) {
	const { user } = useContext(UserContext);

	const isRequestingUser = reqUser.id === user?.id;

	const [rivals, setRivals] = useState(initialRivals);
	const [show, setShow] = useState(false);
	const { settings, setSettings } = useLUGPTSettings();

	const [currentRivals, setCurrentRivals] = useState(initialRivals);

	if (!settings) {
		return <div>Looks like you're not signed in. How did you get to this page?</div>;
	}

	return (
		<>
			{isRequestingUser && currentRivals.toString() !== rivals.toString() && (
				<>
					{/* kind of a stupid way to check whether the array has changed or not, but who cares. */}
					<Col xs={12}>
						<Divider />
					</Col>
					<Col xs={12}>
						<Alert
							className="w-100 d-flex justify-content-center"
							style={{
								backgroundColor: ChangeOpacity(COLOUR_SET.vibrantYellow, 0.2),
								flexDirection: "column",
								flexWrap: "wrap",
							}}
						>
							<div style={{ color: "white" }}>You have unsaved changes!</div>
							<Divider />
							<Button
								size="lg"
								onClick={async () => {
									const res = await APIFetchV1(
										`/users/${reqUser.id}/games/${game}/${playtype}/rivals`,
										{
											method: "PUT",
											body: JSON.stringify({
												rivalIDs: rivals.map((e) => e.id),
											}),
											headers: {
												"Content-Type": "application/json",
											},
										},
										true,
										true
									);

									if (res.success) {
										setCurrentRivals(rivals);
										setSettings({
											...settings,
											rivals: rivals.map((e) => e.id),
										});
									}
								}}
								variant="primary"
							>
								Save Changes
							</Button>
						</Alert>
					</Col>
				</>
			)}
			<Card header={`${isRequestingUser ? "Your" : `${reqUser.username}'s`} Rivals`}>
				<Col xs={12} className="d-flex justify-content-center flex-wrap">
					{rivals.map((e) => (
						<UserIcon key={e.id} user={e} game={game} playtype={playtype}>
							<Button
								variant="outline-danger"
								onClick={() => setRivals(rivals.filter((u) => u.id !== e.id))}
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
							callback={(user) => {
								if (rivals.length >= 5) {
									SendErrorToast(`Can't have more than 5 rivals!`);
								} else {
									setRivals([...rivals, user]);

									// if we're now at max rivals, exit.
									if (rivals.length + 1 >= 5) {
										setShow(false);
									}
								}
							}}
							show={show}
							setShow={setShow}
							url={`/games/${game}/${playtype}/players`}
							excludeSet={rivals.map((e) => e.id)}
							excludeMsg="Added!"
						/>
					</>
				)}
			</Card>

			<Divider />

			<Card
				header={
					<div className="text-center">
						<h3>
							{isRequestingUser ? "Your" : `${reqUser.username}'s`} Reverse Rivals
						</h3>
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
					{challengers.map((e) => (
						<UserIcon key={e.id} user={e} game={game} playtype={playtype}>
							{isRequestingUser &&
								!rivals.map((e) => e.id).includes(e.id) &&
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
