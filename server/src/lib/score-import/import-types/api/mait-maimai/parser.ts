import { CreateBatchManualClassProvider } from "../../common/batch-manual/class-handler";
import { VERSION_STR } from "lib/constants/version";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import { p } from "prudence";
import { FormatPrError } from "tachi-common";
import { PR_BATCH_MANUAL } from "tachi-common/lib/schemas";
import nodeFetch from "utils/fetch";
import { GetMAITAuthGuaranteed } from "utils/queries/auth";
import type { KtLogger } from "lib/logger/logger";
import type { BatchManual, BatchManualScore, integer } from "tachi-common";

export async function ParseMAITMaimai(userID: integer, logger: KtLogger, fetch = nodeFetch) {
	const baseUrl = ServerConfig.MAIT_API_URL;

	if (!baseUrl) {
		throw new ScoreImportFatalError(500, `No API_URL was defined for MAIT.`);
	}

	const authDoc = await GetMAITAuthGuaranteed(userID, logger);

	let json;
	let res;

	try {
		res = await fetch(`${baseUrl}/api/v1/export/tachi`, {
			headers: {
				Authorization: `Bearer ${authDoc.token}`,
				"User-Agent": `${TachiConfig.NAME}/${VERSION_STR}`,
				"Content-Type": "application/json",
			},
			redirect: "manual",
		});
	} catch (err) {
		logger.error("Received invalid response from MAIT.", { err });
		throw new ScoreImportFatalError(500, "Received invalid response from MAIT. Are they down?");
	}

	// The API redirects you to the login page if the API token was invalid.
	if (res.status === 302 && res.headers.get("location") === `${baseUrl}/login`) {
		throw new ScoreImportFatalError(401, "Unable to authenticate with MAIT.");
	}

	let text;

	try {
		// Split this into text -> JSON parse so we can read the text for better error messages
		// in the case of disaster.
		text = await res.text();

		json = JSON.parse(text) as unknown;
	} catch (err) {
		logger.error(
			`Received invalid (non-json) response from MAIT. Status code was ${res.status}.`,
			{ err, text }
		);
		throw new ScoreImportFatalError(500, `Received invalid response from MAIT. Are they down?`);
	}

	const err = p(json, PR_BATCH_MANUAL("maimai", "Single"));

	if (err) {
		throw new ScoreImportFatalError(400, FormatPrError(err, "Invalid BATCH-MANUAL from MAIT."));
	}

	json = json as BatchManual<"maimai:Single">;

	return {
		context: {
			game: "maimai",
			playtype: "Single",
			service: json.meta.service,
			version: json.meta.version ?? null,
		},
		game: "maimai",
		iterable: json.scores,
		classProvider: json.classes ? CreateBatchManualClassProvider(json.classes) : null,
	};
}
