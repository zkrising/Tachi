import { APIFetchV1 } from "util/api";
import { ErrorPage } from "app/pages/ErrorPage";
import useSetSubheader from "components/layout/header/useSetSubheader";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useImport from "components/util/import/useImport";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import React, { useContext, useMemo, useReducer, useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { APIImportTypes, CGCardInfo, GetGameConfig } from "tachi-common";
import { SetState } from "types/react";
import Icon from "components/util/Icon";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import ImportStateRenderer from "./ImportStateRenderer";

interface Props {
	cgType: "dev" | "gan" | "nag";
	game: "sdvx" | "popn" | "museca";
}

export default function CGIntegrationPage({ cgType, game }: Props) {
	const gameConfig = GetGameConfig(game);
	const cgName = cgType === "dev" ? "CG Dev" : `CG ${cgType.toUpperCase()}`;

	const [reload, shouldReloadCardInfo] = useReducer((x) => x + 1, 0);
	const [showEdit, setShowEdit] = useState(false);

	useSetSubheader(["Import Scores", `${gameConfig.name} Sync (${cgName})`]);

	const { user } = useContext(UserContext);

	if (!user) {
		return <ErrorPage statusCode={401} />;
	}

	const { data, error } = useApiQuery<CGCardInfo | null>(
		`/users/${user.id}/integrations/cg/${cgType}`,
		undefined,
		[reload]
	);

	if (error) {
		return <ApiError error={error} />;
	}

	// null is a valid response for this call, so be explicit with going to loading
	if (data === undefined) {
		return <Loading />;
	}

	return (
		<>
			{data && (
				<CGImporter
					cgType={cgType}
					game={game}
					cardID={data.cardID}
					setShowEdit={setShowEdit}
					showEdit={showEdit}
				/>
			)}
			{(showEdit || !data) && (
				<>
					<CGNeedsIntegrate
						cgType={cgType}
						onSubmit={async (cardID, pin) => {
							const res = await APIFetchV1(
								`/users/${user.id}/integrations/cg/${cgType}`,
								{
									method: "PUT",
									body: JSON.stringify({ cardID, pin }),
									headers: {
										"Content-Type": "application/json",
									},
								},
								true,
								true
							);

							if (res.success) {
								shouldReloadCardInfo();
							}
						}}
						initialCardID={data?.cardID.match(/.{1,4}/gu)?.join(" ") ?? undefined}
						initialPin={data?.pin ?? undefined}
						showEdit={showEdit}
					/>
				</>
			)}
		</>
	);
}

function CGImporter({
	cgType,
	game,
	cardID,
	showEdit,
	setShowEdit,
}: Pick<Props, "cgType" | "game"> & {
	cardID: string;
	showEdit: boolean;
	setShowEdit: SetState<boolean>;
}) {
	const importType: APIImportTypes = `api/cg-${cgType}-${game}`;
	const cgName = cgType === "dev" ? "CG Dev" : `CG ${cgType.toUpperCase()}`;

	const { importState, runImport } = useImport("/import/from-api", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			importType,
		}),
	});

	return (
		<>
			<div className="text-center mb-4">
				<span className="fs-2">
					{showEdit ? "Editing" : "Importing scores from"} {cgName} card{" "}
				</span>
				<code className="fs-6 rfs-enabled">{cardID.match(/.{1,4}/gu)?.join(" ")}</code>{" "}
				<span
					className="position-absolute"
					onClick={() => setShowEdit(!showEdit)}
					style={{
						transform: "translateX(.4em) translateY(-.6em)",
						maxHeight: "min-content",
					}}
				>
					<QuickTooltip
						tooltipContent={showEdit ? "Cancel" : "Edit card"}
						className="d-none d-md-block"
					>
						<span>
							<Icon
								type={showEdit ? "xmark" : "pencil"}
								className="cursor-pointer"
								noPad
								style={{
									fontSize: "12px",
								}}
							/>
						</span>
					</QuickTooltip>
				</span>
			</div>
			{showEdit ? undefined : (
				<>
					<Button
						className="mx-auto d-block"
						variant="primary"
						onClick={() => runImport()}
						disabled={
							importState.state === "waiting_init" ||
							importState.state === "waiting_processing"
						}
					>
						{importState.state === "waiting_init" ||
						importState.state === "waiting_processing"
							? "Syncing..."
							: "Click to Sync!"}
					</Button>
					<Divider />
					<div className="text-center mb-4">
						Play on {cgName} a lot? You can synchronise your scores straight from the
						discord by typing <code>/sync</code>!
					</div>
					<ImportStateRenderer state={importState} />
				</>
			)}
		</>
	);
}

export function CGNeedsIntegrate({
	cgType,
	initialCardID,
	initialPin,
	onSubmit,
	showEdit,
}: Pick<Props, "cgType"> & {
	onSubmit: (cardID: string, pin: string) => Promise<void>;
	initialCardID?: string;
	initialPin?: string;
	showEdit: boolean;
}) {
	const cgName = cgType === "dev" ? "CG Dev" : "CG";

	const [CardID, setCardID] = useState(initialCardID ?? "");
	const [pin, setPin] = useState(initialPin ?? "");

	const formatCardID = (e: { target: { value: string } }) => {
		const inputVal = e.target.value.replace(/ /gu, "");
		const splits = inputVal.match(/.{1,4}/gu);

		let outputVal = "";
		if (splits) {
			outputVal = splits.join(" ");
		}

		setCardID(outputVal);
	};

	// strip any whitespace from the auto-formatted CardID
	const realCardID = useMemo(() => CardID.replace(/\s+/gu, ""), [CardID]);

	const shouldDisableCard = useMemo(() => {
		// yes i could turn this into a boolean with !
		// but have you *seen* how ugly that is?
		if (/^[a-zA-Z0-9]{16}$/u.exec(realCardID)) {
			return false;
		}
		return true;
	}, [realCardID]);

	const shouldDisablePin = useMemo(() => {
		if (/^[0-9]{4}$/u.exec(pin)) {
			return false;
		}
		return true;
	}, [pin]);

	return (
		<>
			{showEdit ? "" : <h2 className="text-center mb-4">Set your {cgName} card.</h2>}
			<Form.Text>
				This is the card ID that's displayed in game. It should be 16 characters long.
			</Form.Text>
			<InputGroup className="mb-4 mt-2">
				<InputGroup.Text>Card ID</InputGroup.Text>
				{realCardID.length >= 1 ? (
					<span
						className={`form-length-validation z-index-1 ${
							shouldDisableCard ? "text-danger" : "text-success"
						}`}
					>
						{realCardID.length}/16
					</span>
				) : undefined}
				<Form.Control
					className="form-translucent"
					onChange={formatCardID}
					value={CardID}
					maxLength={19}
					isInvalid={CardID.length !== 0 && shouldDisableCard}
					isValid={CardID.length !== 0 && !shouldDisableCard}
				/>
			</InputGroup>
			<Form.Text>
				What PIN do you use to card in to {cgName}? It should be 4 digits long.
			</Form.Text>
			<InputGroup className="my-2">
				<InputGroup.Text>PIN</InputGroup.Text>
				<Form.Control
					className="form-translucent"
					onChange={(e) => setPin(e.target.value)}
					value={pin}
					type="password"
					maxLength={4}
					isInvalid={pin.length !== 0 && shouldDisablePin}
					isValid={pin.length !== 0 && !shouldDisablePin}
				/>
			</InputGroup>
			<small
				className={`text-danger ${
					pin.length >= 4 && shouldDisablePin ? "visible" : "invisible"
				}`}
			>
				PIN contains non-digit characters!
			</small>

			<Button
				disabled={shouldDisableCard || shouldDisablePin}
				onClick={() => onSubmit(realCardID, pin)}
				className="m-auto d-block mt-2"
			>
				Submit Card ID
			</Button>
		</>
	);
}
