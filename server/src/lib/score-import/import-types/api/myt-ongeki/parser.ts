import {
	FetchMytTitleAPIID,
	GetMytHostname,
	StreamRPCAsAsync,
} from "../../common/api-myt/traverse-api";
import { credentials } from "@grpc/grpc-js";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import type { ParserFunctionReturns } from "../../common/types";
import type { MytOngekiScore } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { integer } from "tachi-common";
import type { EmptyObject } from "utils/types";
import { OngekiUserClient } from "proto/generated/ongeki/user_grpc_pb";
import {
	GetPlaylogRequest,
	GetPlaylogStreamItem,
} from "proto/generated/ongeki/user_pb";

async function* getObjectsFromGrpcIterable(
	iterable: AsyncIterable<GetPlaylogStreamItem>,
): AsyncIterable<MytOngekiScore> {
	for await (const item of iterable) {
		yield item.toObject();
	}
}

export default async function ParseMytOngeki(
	userID: integer,
	logger: KtLogger,
): Promise<ParserFunctionReturns<MytOngekiScore, EmptyObject>> {
	const profileApiId = await FetchMytTitleAPIID(userID, "ongeki", logger);
	const endpoint = GetMytHostname();
	const client = new OngekiUserClient(endpoint, credentials.createSsl());
	const request = new GetPlaylogRequest();
	request.setProfileApiId(profileApiId);

	let iterable;

	try {
		const stream = StreamRPCAsAsync(
			client.getPlaylog.bind(client),
			request,
			logger,
		);

		iterable = getObjectsFromGrpcIterable(stream);
	} catch (err) {
		logger.error(
			`Unexpected MYT error while streaming Ongeki playlog items for userID ${userID}: ${err}`,
		);

		throw new ScoreImportFatalError(500, `Failed to get scores from MYT.`);
	}

	return {
		iterable,
		context: {},
		classProvider: null,
		game: "ongeki",
	};
}
