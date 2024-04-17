import CreateMytWACCAClassHandler from "./class-handler";
import {
	FetchMytTitleAPIID,
	GetMytHostname,
	StreamRPCAsAsync,
} from "../../common/api-myt/traverse-api";
import { credentials } from "@grpc/grpc-js";
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
	const client = new WaccaUserClient(endpoint, credentials.createSsl());
	const req = new PlaylogRequest();

	req.setApiId(titleApiId);
	const stream = StreamRPCAsAsync(client.getPlaylog.bind(client), req, logger);
	const iterable = getObjectsFromGrpcIterable(stream);

	const classProvider = await CreateMytWACCAClassHandler(titleApiId, client);

	return {
		iterable,
		context: {},
		classProvider,
		game: "wacca",
	};
}
