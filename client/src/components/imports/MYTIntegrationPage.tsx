import { APIFetchV1 } from "util/api";
import { ErrorPage } from "app/pages/ErrorPage";
import useSetSubheader from "components/layout/header/useSetSubheader";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import FormInput from "components/util/FormInput";
import Loading from "components/util/Loading";
import useImport from "components/util/import/useImport";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import React, { useContext, useMemo, useReducer, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { APIImportTypes, GetGameConfig, MytCardInfo } from "tachi-common";
import { SetState } from "types/react";
import Icon from "components/util/Icon";
import ImportStateRenderer from "./ImportStateRenderer";

interface Props {
	game: "chunithm" | "maimaidx" | "ongeki" | "wacca";
}

export default function MytIntegrationPage({ game }: Props) {
	const gameConfig = GetGameConfig(game);

	const [reload, shouldReloadCardInfo] = useReducer((x) => x + 1, 0);
	const [showEdit, setShowEdit] = useState(false);

	useSetSubheader(["Import Scores", `${gameConfig.name} Sync (MYT)`]);

	const { user } = useContext(UserContext);

	if (!user) {
		return <ErrorPage statusCode={401} />;
	}

	const { data, error } = useApiQuery<MytCardInfo | null>(
		`/users/${user.id}/integrations/myt`,
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
		<div>
			{(showEdit || !data) && (
				<>
					<MytNeedsIntegrate
						onSubmit={async (cardAccessCode) => {
							const res = await APIFetchV1(
								`/users/${user.id}/integrations/myt`,
								{
									method: "PUT",
									body: JSON.stringify({ cardAccessCode }),
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
						initialCardAccessCode={data?.cardAccessCode ?? undefined}
					/>
					<Divider />
				</>
			)}
			{data && (
				<MytImporter
					game={game}
					cardAccessCode={data.cardAccessCode}
					setShowEdit={setShowEdit}
					showEdit={showEdit}
				/>
			)}
		</div>
	);
}

function MytImporter({
	game,
	cardAccessCode,
	showEdit,
	setShowEdit,
}: Pick<Props, "game"> & {
	cardAccessCode: string;
	showEdit: boolean;
	setShowEdit: SetState<boolean>;
}) {
	const importType: APIImportTypes = `api/myt-${game}`;

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
		<div>
			<h2 className="text-center mb-4">
				Importing scores from MYT card{" "}
				<code>{cardAccessCode.match(/.{1,4}/gu)?.join(" ")}</code>{" "}
				<Icon
					onClick={() => setShowEdit(!showEdit)}
					type={showEdit ? "times" : "pencil-alt"}
					noPad
				/>
				.
			</h2>
			<Divider />
			<div className="d-flex w-100 justify-content-center">
				<Button
					className="mx-auto"
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
			</div>
			<Divider />
			<div>
				Play on MYT a lot? You can synchronise your scores straight from the discord by
				typing <code>/sync</code>!
			</div>
			<Divider />
			<ImportStateRenderer state={importState} />
		</div>
	);
}

export function MytNeedsIntegrate({
	initialCardAccessCode,
	onSubmit,
}: {
	initialCardAccessCode?: string;
	onSubmit: (cardAccessCode: string) => Promise<void>;
}) {
	const [cardAccessCode, setCardAccessCode] = useState(initialCardAccessCode ?? "");

	// strip any whitespace the user feels like entering
	const realCardAccessCode = useMemo(() => cardAccessCode.replace(/\s+/gu, ""), [cardAccessCode]);

	const validCardAccessCode = useMemo(
		// Note: valid Myt cards must start with 0 or 3 as 0008, sega, or aime cards.
		// See https://sega.bsnk.me/misc/card_convert/#lookup-a-card / https://sega.bsnk.me/allnet/access_codes/
		// We only implement this in client-side because it's just meant to be a
		// user hint, in case someone tries to enter an AIC code or something.
		() => /^[03][0-9]{19}$/u.exec(realCardAccessCode),
		[realCardAccessCode]
	);

	return (
		<div>
			<h3 className="text-center mb-4">Set your MYT card.</h3>

			<FormInput
				fieldName="Card Access Code"
				setValue={setCardAccessCode}
				value={cardAccessCode}
			/>
			<Form.Label>
				This is the card access code that's displayed in game. It should be 20 digits.
				<br />
				{cardAccessCode.length > 0 && !validCardAccessCode ? (
					<span className="text-danger">
						Invalid card access code. This should be exactly 20 digits as displayed in
						game. It may not be the same as the code on the back of your card.
					</span>
				) : (
					cardAccessCode.length > 0 && <span className="text-success">Looking good!</span>
				)}
			</Form.Label>

			<Divider />
			<div className="w-100 d-flex justify-content-center">
				<Button
					disabled={!validCardAccessCode}
					onClick={() => onSubmit(realCardAccessCode)}
				>
					Submit Card Access Code
				</Button>
			</div>
		</div>
	);
}
