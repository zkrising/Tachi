import { CommandInteraction } from "discord.js";
import {
	ChartDocument,
	FolderDocument,
	Game,
	GoalDocument,
	ImportDocument,
	integer,
	PBScoreDocument,
	Playtype,
	PublicUserDocument,
	SongDocument,
} from "tachi-common";
import { LoggerLayers } from "../data/data";
import { RequestTypes, TachiServerV1Get, TachiServerV1Request } from "./fetchTachi";
import { CreateLayeredLogger } from "./logger";
import { Sleep } from "./misc";
import { ImportDeferred, ImportPollStatus, UGPTStats } from "./returnTypes";

const logger = CreateLayeredLogger(LoggerLayers.apiRequests);

export async function GetUserInfo(userID: integer | string) {
	const res = await TachiServerV1Get<PublicUserDocument>(`/users/${userID}`, null);

	if (!res.success) {
		throw new Error(`Failed to fetch user with userID ${userID}.`);
	}

	return res.body;
}

export async function GetUGPTStats(userID: integer | string, game: Game, playtype: Playtype) {
	const res = await TachiServerV1Get<UGPTStats>(
		`/users/${userID}/games/${game}/${playtype}`,
		null
	);

	if (!res.success) {
		throw new Error(`Failed to fetch UGPT stats for userID ${userID}, ${game}, ${playtype}.`);
	}

	return res.body;
}

export async function GetGoalWithID(goalID: string, game: Game, playtype: Playtype) {
	const res = await TachiServerV1Get<GoalDocument>(
		`/games/${game}/${playtype}/goals/${goalID}`,
		null
	);

	if (!res.success) {
		throw new Error(`Failed to fetch goal with ID ${goalID}. '${res.description}'.`);
	}

	return res.body;
}

export async function GetChartInfoForUser(
	userID: integer | string,
	chartID: string,
	game: Game,
	playtype: Playtype
) {
	const res = await TachiServerV1Get<{ song: SongDocument; chart: ChartDocument }>(
		`/games/${game}/${playtype}/charts/${chartID}`,
		null
	);

	if (!res.success) {
		throw new Error(`Failed to fetch song/chart with chartID ${chartID}.`);
	}

	const pbRes = await TachiServerV1Get<{ chart: ChartDocument; pb: PBScoreDocument }>(
		`/users/${userID}/games/${game}/${playtype}/pbs/${chartID}`,
		null
	);

	const pb = pbRes.success ? pbRes.body.pb : null;

	if (pb === null && pbRes.statusCode !== 404) {
		throw new Error(`Failed to fetch score info for userID ${userID} on chart ${chartID}.`);
	}

	return { song: res.body.song, chart: res.body.chart, pb };
}

export async function PerformScoreImport(
	url: string,
	authToken: string,
	body: Record<string, unknown>,
	interaction?: CommandInteraction
) {
	const initRes = await TachiServerV1Request<ImportDocument | ImportDeferred>(
		RequestTypes.POST,
		url,
		authToken,
		body
	);

	if (!initRes.success) {
		logger.error(`Failed to perform score import on ${url}.`, { body });
		throw new Error(`Failed to perform import on ${url}.`);
	}

	// this server does not defer imports to a scorequeue
	if (initRes.statusCode === 200) {
		const result = initRes.body as ImportDocument;

		return result;
	} else if (initRes.statusCode === 202) {
		// this server defers imports.

		// eslint-disable-next-line no-constant-condition
		while (true) {
			// eslint-disable-next-line no-await-in-loop
			const pollRes = await TachiServerV1Get<ImportPollStatus>(
				`/imports/${initRes.body.importID}/poll-status`,
				authToken
			);

			if (pollRes.success) {
				if (pollRes.body.importStatus === "completed") {
					if (interaction) {
						interaction.editReply(`Import finished!`);
					}

					return pollRes.body.import;
				} else {
					if (interaction) {
						interaction.editReply(
							`Importing Scores: ${
								pollRes.body.progress.description ?? "Importing."
							}..`
						);
					}

					// eslint-disable-next-line no-await-in-loop
					await Sleep(1000);
				}
			} else {
				throw new Error(`Failed to import scores. ${pollRes.description}.`);
			}
		}
	}

	logger.error(`Unexpected status code ${initRes.statusCode} returned from ${url}.`, { body });

	throw new Error(`Unexpected status code ${initRes.statusCode} returned from ${url}.`);
}

export async function FindFolders(game: Game, playtype: Playtype, folderName: string) {
	const res = await TachiServerV1Get<FolderDocument[]>(
		`/games/${game}/${playtype}/folders`,
		null,
		{
			search: folderName,
		}
	);

	if (!res.success) {
		throw new Error(res.description);
	}

	return res.body;
}
