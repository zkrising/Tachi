import { CommandInteraction } from "discord.js";
import { ImportDocument, integer, PublicUserDocument } from "tachi-common";
import { RequestTypes, TachiServerV1Get, TachiServerV1Request } from "./fetch-tachi";
import logger from "./logger";
import { Sleep } from "./misc";
import { ImportDeferred, ImportPollStatus } from "./return-types";

export async function GetUserInfo(userID: integer) {
	const res = await TachiServerV1Get<PublicUserDocument>(`/users/${userID}`, null);

	if (!res.success) {
		throw new Error(`Failed to fetch user with userID ${userID}.`);
	}

	return res.body;
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

		let isImportFinished = false;

		while (!isImportFinished) {
			const pollRes = await TachiServerV1Get<ImportPollStatus>(
				`/imports/${initRes.body.importID}/poll-status`,
				authToken
			);

			if (pollRes.success) {
				if (pollRes.body.importStatus === "completed") {
					isImportFinished = true;
					return pollRes.body.import;
				} else {
					// UPDATE REFERENCE MESSAGE WITH PROGRESS

					if (interaction) {
						interaction.editReply(
							`Importing Scores: ${
								pollRes.body.progress.description ?? "Importing."
							}..`
						);
					}

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
