import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import ApiError from "components/util/ApiError";
import DiscordLink from "components/util/DiscordLink";
import Divider from "components/util/Divider";
import ExternalLink from "components/util/ExternalLink";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { UserContext } from "context/UserContext";
import { TachiConfig } from "lib/config";
import React, { useContext, useState } from "react";
import { Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	APIImportTypes,
	FileUploadImportTypes,
	Game,
	GetGameConfig,
	ImportTypes,
	integer,
	UserDocument,
} from "tachi-common";

export default function ImportPage({ user }: { user: UserDocument }) {
	useSetSubheader(["Import Scores"]);

	const [game, setGame] = useState<Game | null>(null);

	return (
		<div>
			<div>
				<h4>
					Here, you can import score files, Synchronise with existing services, or set up
					in-game automatic score uploading!
				</h4>
				Don't see what you want here? Make a <a>Feature Request</a>, or ask around on the{" "}
				<DiscordLink>Discord</DiscordLink>.
				<br />
				Know how to program, and want to write a script yourself? Check out{" "}
				<ExternalLink href="https://docs.bokutachi.xyz/tachi-server/batch-manual">
					Batch Manual
				</ExternalLink>
				.
				<br />
				Want to manage or revert an import? Go to{" "}
				<Link to={`/u/${user.username}/imports`}>Import Management</Link>.
			</div>
			<Divider />
			<select
				className="form-control"
				onChange={(e) => setGame(e.target.value === "" ? null : (e.target.value as Game))}
			>
				<option value="">Please select a game.</option>
				{TachiConfig.games.map((e) => (
					<option value={e} key={e}>
						{GetGameConfig(e).name}
					</option>
				))}
			</select>
			<Divider />

			{game ? <ImportInfoDisplayer game={game} /> : <ShowRecentImports />}
		</div>
	);
}

function ShowRecentImports() {
	const { user } = useContext(UserContext);

	if (!user) {
		return <>You're not signed in.</>;
	}

	return <InnerShowRecentImports user={user} />;
}

function InnerShowRecentImports({ user }: { user: UserDocument }) {
	const { data, error } = useApiQuery<{ importType: ImportTypes; count: integer }[]>(
		`/users/${user.id}/recent-imports`
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const filteredData = data.filter(
		(e) => e.importType.startsWith("file/") || e.importType.startsWith("api/")
	);

	if (filteredData.length === 0) {
		return null;
	}

	return (
		<>
			<h4>Recently Used Import Methods</h4>
			<Divider />
			<Row>
				{filteredData.map((e) => (
					<ImportTypeInfoCard
						key={e.importType}
						importType={e.importType as FileUploadImportTypes | APIImportTypes}
					/>
				))}
			</Row>
		</>
	);
}

function ImportInfoDisplayer({ game }: { game: Game }) {
	const gameConfig = GetGameConfig(game);

	const Content = [<ImportTypeInfoCard key="file/batch-manual" importType="file/batch-manual" />];

	if (game === "iidx") {
		Content.unshift(
			<ImportInfoCard
				name="Fervidex"
				href="fervidex"
				desc="Automatically import scores from INFINITAS and other clients, whenever they are achieved!"
				moreInfo="This is the recommended way to import scores, as it provides quality data in real-time."
				key="Fervidex"
			/>,
			<ImportTypeInfoCard
				key="file/eamusement-iidx-csv"
				importType="file/eamusement-iidx-csv"
			/>,
			<ImportTypeInfoCard key="api/flo-iidx" importType="api/flo-iidx" />,
			<ImportTypeInfoCard key="api/eag-iidx" importType="api/eag-iidx" />,
			<ImportTypeInfoCard key="file/solid-state-squad" importType="file/solid-state-squad" />,
			<ImportTypeInfoCard key="file/pli-iidx-csv" importType="file/pli-iidx-csv" />
		);
	} else if (game === "sdvx") {
		Content.unshift(
			<ImportInfoCard
				name="Barbatos"
				href="barbatos"
				desc="Automatically import scores, whenever you get them!"
				moreInfo="This is the recommended way to import SDVX scores, as it provides high quality data in real-time."
				key="Barbatos"
			/>,
			<ImportInfoCard
				name="Konaste Hook"
				href="ks-hook"
				desc="Automatically import scores from SDVX 6 Konaste!"
				moreInfo="Yep, it's that simple."
				key="Konaste Hook"
			/>,
			<ImportTypeInfoCard
				key="file/eamusement-sdvx-csv"
				importType="file/eamusement-sdvx-csv"
			/>,
			<ImportTypeInfoCard key="api/flo-sdvx" importType="api/flo-sdvx" />,
			<ImportTypeInfoCard key="api/eag-sdvx" importType="api/eag-sdvx" />,
			<ImportTypeInfoCard key="api/cg-dev-sdvx" importType="api/cg-dev-sdvx" />,
			<ImportTypeInfoCard key="api/cg-prod-sdvx" importType="api/cg-prod-sdvx" />,
			<ImportTypeInfoCard key="api/min-sdvx" importType="api/min-sdvx" />
		);
	} else if (game === "chunithm") {
		Content.unshift(
			<ImportInfoCard
				name="Chunitachi"
				href="chunitachi"
				desc="Automatically import scores, whenever you get them!"
				moreInfo="This is the recommended way to import CHUNITHM scores, as it provides high quality data in real-time."
				key="Chunitachi"
			/>
		);
	} else if (game === "bms") {
		Content.unshift(
			<ImportInfoCard
				name="LR2oraja IR"
				href="lr2oraja-ir"
				desc="Automatically import scores, whenever you get them!"
				moreInfo="This is the recommended way to import BMS scores, as it provides high quality data in real-time."
				key="LR2oraja IR"
			/>,
			<ImportInfoCard
				name="LR2 Hook"
				href="lr2hook"
				desc="Automatically import scores, whenever you get them (in LR2)!"
				moreInfo="This is the recommended way to import LR2 BMS scores, as it provides high quality data in real-time."
				key="LR2 IR"
			/>,
			<ImportInfoCard
				name="LR2oraja Database Import"
				href="lr2oraja-db"
				desc="Import scores from a LR2oraja score database file."
				moreInfo="This should be done once initially to sync scores up, but not all the time, as it provides worse quality data."
				key="LR2oraja Database Import"
			/>,
			<ImportInfoCard
				name="LR2 Database Import"
				href="lr2-db"
				desc="Import scores from a LR2 score database file."
				moreInfo="This should be done once initially to sync scores up, but not all the time, as it provides worse quality data."
				key="LR2 Database Import"
			/>
		);
	} else if (game === "usc") {
		Content.unshift(
			<ImportInfoCard
				name="USC IR"
				href="usc-ir"
				desc="Automatically import scores, whenever you get them!"
				moreInfo="This is the recommended way to import USC scores, as it provides high quality data in real-time."
				key="USC IR"
			/>,
			<ImportInfoCard
				name="USC Database Import"
				href="usc-db"
				desc="Import scores from a USC score database file."
				moreInfo="This should be done once initially to sync scores up, but not all the time, as it provides worse quality data."
				key="USC Database Import"
			/>
		);
	} else if (game === "popn") {
		Content.unshift(
			<ImportInfoCard
				name="Silent Hook"
				href="silent-hook"
				desc={`Automatically upload Pop'n scores to ${TachiConfig.name}!`}
				moreInfo="Yep, it's that simple."
				key="Silent Hook"
			/>,
			<ImportTypeInfoCard key="api/cg-dev-popn" importType="api/cg-dev-popn" />,
			<ImportTypeInfoCard key="api/cg-prod-popn" importType="api/cg-prod-popn" />
		);
	} else if (game === "pms") {
		Content.unshift(
			<ImportInfoCard
				name="Beatoraja IR"
				href="beatoraja-ir-pms"
				desc="Automatically import scores, whenever you get them!"
				moreInfo="This is the recommended way to import PMS scores, as it provides high quality data in real-time."
				key="Beatoraja IR"
			/>
		);
	} else if (game === "wacca") {
		Content.unshift(
			<ImportInfoCard
				name="WaccaMyPageScraper"
				href="wacca-mypage-scraper"
				desc="Use your data from WaccaMyPageScraper."
				moreInfo="If you saved your play data from MyPage using XezolesS's WaccaMyPageScraper project, you can import it here."
				key="WACCA MyPage Scraper"
			/>
		);
	} else if (game === "museca") {
		Content.unshift(
			<ImportTypeInfoCard key="api/cg-dev-museca" importType="api/cg-dev-museca" />,
			<ImportTypeInfoCard key="api/cg-prod-museca" importType="api/cg-prod-museca" />
		);
	} else if (game === "itg") {
		Content.unshift(
			<ImportInfoCard
				name="Simply Love ITGMania Module"
				href="itghook"
				desc="Automatically import scores, whenever you get them (in ITGMania)!"
				key="SL-ITG"
			/>
		);
	} // else if (game === "jubeat") {
	// 	Content.unshift(
	// 		<ImportTypeInfoCard key="api/cg-dev-jubeat" importType="api/cg-dev-jubeat" />,
	// 		<ImportTypeInfoCard key="api/cg-prod-jubeat" importType="api/cg-prod-jubeat" />
	// 	);
	// }

	return (
		<>
			<div className="text-center mb-4">
				<h1>{gameConfig.name}</h1>
			</div>
			<div className="row justify-content-center">{Content}</div>
		</>
	);
}

function ImportTypeInfoCard({
	importType,
}: {
	importType: FileUploadImportTypes | APIImportTypes;
}): JSX.Element | null {
	if (!TachiConfig.importTypes.includes(importType)) {
		return null;
	}

	switch (importType) {
		case "api/eag-iidx":
			return (
				<ImportInfoCard
					name="EAG Integration"
					href="iidx-eag"
					desc="Pull your IIDX scores from the EAG Network."
					moreInfo="Note: All networks are reduced to their first three letters for anonymity reasons."
					key="iidx-eag"
				/>
			);
		case "api/flo-iidx":
			return (
				<ImportInfoCard
					name="FLO Integration"
					href="iidx-flo"
					desc="Pull your IIDX scores from the FLO Network."
					moreInfo="Note: All networks are reduced to their first three letters for anonymity reasons."
					key="iidx-flo"
				/>
			);
		case "api/flo-sdvx":
			return (
				<ImportInfoCard
					name="FLO Integration"
					href="sdvx-flo"
					desc="Pull your SDVX scores from the FLO Network."
					moreInfo="Note: All networks are reduced to their first three letters for anonymity reasons."
					key="sdvx-flo"
				/>
			);
		case "api/eag-sdvx":
			return (
				<ImportInfoCard
					name="EAG Integration"
					href="sdvx-eag"
					desc="Pull your SDVX scores from the EAG Network."
					moreInfo="Note: All networks are reduced to their first three letters for anonymity reasons."
					key="sdvx-eag"
				/>
			);
		case "api/min-sdvx":
			return (
				<ImportInfoCard
					name="MIN Integration"
					href="sdvx-min"
					desc="Pull your SDVX scores from the MIN Network."
					moreInfo="Note: All networks are reduced to their first three letters for anonymity reasons."
					key="sdvx-min"
				/>
			);
		case "api/cg-dev-sdvx":
			return (
				<ImportInfoCard
					name="CG Dev Integration"
					href="cg-dev-sdvx"
					desc="Pull your SDVX scores from the CG Dev Network."
					key="cg-dev-sdvx"
				/>
			);
		case "api/cg-prod-sdvx":
			return (
				<ImportInfoCard
					name="CG Prod Integration"
					href="cg-prod-sdvx"
					desc="Pull your SDVX scores from the CG Network."
					key="cg-prod-sdvx"
				/>
			);
		case "api/cg-dev-popn":
			return (
				<ImportInfoCard
					name="CG Dev Integration"
					href="cg-dev-popn"
					desc="Pull your pop'n music scores from the CG Dev Network."
					key="cg-dev-popn"
				/>
			);
		case "api/cg-prod-popn":
			return (
				<ImportInfoCard
					name="CG Prod Integration"
					href="cg-prod-popn"
					desc="Pull your pop'n music scores from the CG Network."
					key="cg-prod-popn"
				/>
			);
		case "api/cg-dev-museca":
			return (
				<ImportInfoCard
					name="CG Dev Integration"
					href="cg-dev-museca"
					desc="Pull your MUSECA scores from the CG Dev Network."
					key="cg-dev-museca"
				/>
			);
		case "api/cg-prod-museca":
			return (
				<ImportInfoCard
					name="CG Prod Integration"
					href="cg-prod-museca"
					desc="Pull your MUSECA scores from the CG Network."
					key="cg-prod-museca"
				/>
			);
		case "file/eamusement-iidx-csv":
			return (
				<ImportInfoCard
					name="E-Amusement CSV"
					href="iidx-eam-csv"
					desc="Use the official E-Amusement CSV to import scores."
					moreInfo="Note: This format has issues with timestamps, since it stores only one timestamp per song. Playing the same song on different difficulties in a session will result in broken timestamps on your account."
					key="E-Amusement CSV"
				/>
			);
		case "file/solid-state-squad":
			return (
				<ImportInfoCard
					name="SOLID STATE SQUAD .xml"
					href="sss-xml"
					desc="Use a SOLID STATE SQUAD XML file to import scores. This service is rather old, and was originally for manually tracking CS scores. However, it still exports data, and we still support it!"
					moreInfo="Also, these guys provide pretty good quality data, especially for the time."
					key="SOLID STATE SQUAD .xml"
				/>
			);
		case "file/eamusement-sdvx-csv":
			return (
				<ImportInfoCard
					name="E-Amusement CSV"
					href="sdvx-eam-csv"
					desc="Use the official E-Amusement CSV to import scores."
					moreInfo="Note: This format doesn't support timestamps, which means sessions cannot be generated from it."
					key="SDVX E-Amusement CSV"
				/>
			);
		case "file/batch-manual":
			return (
				<ImportInfoCard
					name="Batch Manual"
					href="batch-manual"
					desc={`A JSON format ${TachiConfig.name} recognises and can import scores from. This is for programmers to create their own import scripts.`}
					moreInfo={
						<>
							Check{" "}
							<ExternalLink href="https://docs.bokutachi.xyz/tachi-server/batch-manual">
								the documentation
							</ExternalLink>
							.
						</>
					}
					key="Batch Manual"
				/>
			);
		case "file/mer-iidx":
			return (
				<ImportInfoCard
					name="MER .json"
					href="iidx-mer"
					desc="Use a MER-exported .json file to synchronise scores."
					moreInfo="Note: Scores that do not match an existing song on the site will be orphaned, and anyone can see your orphaned scores. Don't be an idiot. I highly recommend using Fervidex instead."
					key="MER .json"
				/>
			);
		case "file/pli-iidx-csv":
			return (
				<ImportInfoCard
					name="PLI .csv"
					href="iidx-pli-csv"
					desc="Use a PLI .csv file to import scores."
					moreInfo="Note: This network is currently not being developed on. I highly recommend switching to anything else. I highly recommend using Fervidex instead, and just using this once to sync things up."
					key="PLI .csv"
				/>
			);
		case "file/mypagescraper-records-csv":
		case "file/mypagescraper-player-csv":
			// We only expect people to use these import types once ever, so don't recommend them.
			return <></>;
		default:
			// For some reason, the webpack tschecker thinks
			// that the above switch isn't exhaustive. However, it is.
			return (
				<>
					Err: Unknown importType <code>{importType}</code>
				</>
			);
	}
}

function ImportInfoCard({
	name,
	href,
	desc,
	moreInfo,
}: {
	name: string;
	href: string;
	desc: string;
	moreInfo?: React.ReactChild;
}) {
	return (
		<div className="col-12 col-lg-6 mb-4">
			<Card header={name} footer={<LinkButton to={`/import/${href}`}>Use this!</LinkButton>}>
				<div style={{ fontSize: "1.5rem" }}>{desc}</div>
				{moreInfo && (
					<>
						<Divider />
						<div>{moreInfo}</div>
					</>
				)}
			</Card>
		</div>
	);
}
