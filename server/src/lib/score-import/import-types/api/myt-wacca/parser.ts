import CreateMytWACCAClassHandler from "./class-handler";
import {
	FetchMytTitleAPIID,
	GetMytHostname,
	StreamRPCAsAsync,
} from "../../common/api-myt/traverse-api";
import { credentials } from "@grpc/grpc-js";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { WaccaUserClient } from "proto/generated/wacca/user_grpc_pb";
import { PlaylogRequest } from "proto/generated/wacca/user_pb";
import type { ParserFunctionReturns } from "../../common/types";
import type { MytWaccaScore } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { PlaylogStreamItem } from "proto/generated/wacca/user_pb";
import type { integer } from "tachi-common";
import type { EmptyObject } from "utils/types";

async function* getObjectsFromGrpcIterable(
	iterable: AsyncIterable<PlaylogStreamItem>
): AsyncIterable<MytWaccaScore> {
	for await (const item of iterable) {
		// Re: non-null assertion - in GRPC, all fields are always technically optional.
		// Realistically, it's ok to crash if this is undefined - it should never be.
		yield item.getInfo()!.toObject();
	}
}

export default async function ParseMytWACCA(
	userID: integer,
	logger: KtLogger
): Promise<ParserFunctionReturns<MytWaccaScore, EmptyObject>> {
	const titleApiId = await FetchMytTitleAPIID(userID, "wacca", logger);
	const endpoint = GetMytHostname();
	let client;

	try {
		client = new WaccaUserClient(endpoint, credentials.createSsl());
	} catch (err) {
		// Note: I don't think this actually does anything on the network, so
		// it shouldn't really fail. Still, wrap just in case.

		logger.error(`Unexpected MYT during WaccaUserClient creation for ${userID}: ${err}`, {
			userID,
			err,
		});

		throw new ScoreImportFatalError(500, `Failed to connect to MYT.`);
	}

	const req = new PlaylogRequest();

	req.setApiId(titleApiId);

	let iterable;

	try {
		const stream = StreamRPCAsAsync(client.getPlaylog.bind(client), req, logger);

		iterable = getObjectsFromGrpcIterable(stream);
	} catch (err) {
		logger.error(
			`Unexpected MYT error while streaming WACCA playlog items for userID ${userID}: ${err}`
		);

		throw new ScoreImportFatalError(500, `Failed to get scores from MYT.`);
	}

	let classProvider;

	try {
		classProvider = await CreateMytWACCAClassHandler(titleApiId, client);
	} catch (err) {
		logger.error(
			`Unexpected MYT error while fetching player data for userID ${userID}: ${err}`
		);

		throw new ScoreImportFatalError(500, `Failed to fetch player data from MYT.`);
	}

	return {
		iterable,
		context: {},
		classProvider,
		game: "wacca",
	};
}
