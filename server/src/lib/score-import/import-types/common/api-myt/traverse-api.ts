import { GameToMytGame } from "./util";
import { Metadata, credentials } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import db from "external/mongo/db";
import ScoreImportFatalError from "lib/score-import/framework/score-importing/score-import-error";
import { ServerConfig } from "lib/setup/config";
import { CardsClient } from "proto/generated/cards/cards_grpc_pb";
import { LookupRequest } from "proto/generated/cards/cards_pb";
import { GetGameConfig, type integer } from "tachi-common";
import type {
	requestCallback,
	ClientReadableStream,
	ServiceError,
	CallOptions,
} from "@grpc/grpc-js";
import type { KtLogger } from "lib/logger/logger";
import type { LookupResponse } from "proto/generated/cards/cards_pb";
import type { Game } from "tachi-common";

// Hardcode all requests to time out after 10m.
// 6000 scores seems to take more than 30 seconds. 5mins seems like a safe upper bound.
const GRPC_TIMEOUT_SECS = 10 * 60;

export function GetMytHostname(): string {
	const hostname = ServerConfig.MYT_API_HOST;

	if (hostname === undefined) {
		throw new ScoreImportFatalError(
			500,
			`Tried to get MYT API server host, yet was not defined?`
		);
	}

	return hostname;
}

function CreateAuthenticatedMetadata() {
	const auth = new Metadata();
	const authToken = ServerConfig.MYT_AUTH_TOKEN;

	if (authToken === undefined) {
		throw new ScoreImportFatalError(500, `Tried to get MYT auth token, yet was not defined?`);
	}

	auth.add("Authorization", `Bearer ${authToken}`);
	return auth;
}

function CreateDeadlineOptions() {
	const deadline = new Date().setSeconds(new Date().getSeconds() + GRPC_TIMEOUT_SECS);

	return { deadline };
}

export function UnaryRPCAsAsync<TIn, TOut>(
	unaryCall: (
		argument: TIn,
		metadata: Metadata,
		options: CallOptions,
		callback: requestCallback<TOut>
	) => void,
	argument: TIn
): Promise<TOut> {
	return new Promise((resolve, reject) => {
		unaryCall(
			argument,
			CreateAuthenticatedMetadata(),
			CreateDeadlineOptions(),
			(error, value) => {
				if (error) {
					reject(error);
				}

				resolve(value!);
			}
		);
	});
}

export async function* StreamRPCAsAsync<TIn, TOut>(
	streamingCall: (
		argument: TIn,
		metadata: Metadata,
		options: CallOptions
	) => ClientReadableStream<TOut>,
	argument: TIn,
	logger: KtLogger
): AsyncIterable<TOut> {
	try {
		const stream = streamingCall(
			argument,
			CreateAuthenticatedMetadata(),
			CreateDeadlineOptions()
		);
		let err: Error | null = null;

		// If we don't have stream.on("error"), or if we throw the error within
		// this callback, it's not caught properly and will crash the whole node
		// process. Note: if there are multiple errors within one stream, some may
		// be dropped... so be it.
		stream.on("error", (e) => (err = e));
		// ClientReadableStream already implements AsyncIterable<any> vs Readable,
		// but we know that it will really be AsyncIterable<TOut>.
		for await (const streamItem of stream) {
			yield streamItem as TOut;
		}

		// TS doesn't realize that err can be set to an Error by stream.on, so it
		// thinks the type of err is always null. Fix by casting.
		const fixedErr = err as Error | null;

		if (fixedErr !== null) {
			throw fixedErr;
		}
	} catch (err) {
		logger.error(`Error while streaming score data from MYT: ${err}`);

		// Avoid rethrowing the error as it may reveal things like the upstream
		// server IP address.
		throw new ScoreImportFatalError(500, `Error while streaming score data from MYT`);
	}
}

function errIsServiceError(err: Error): err is ServiceError {
	return "code" in err && "details" in err && "metadata" in err;
}

/**
 * The Myt API is (currently) based on card access codes, which you can use to
 * get a "title_api_id" (see proto/cards/cards.proto).
 * The title_api_id uniquely identifies a player and a game ("title"). As such,
 * the first step for syncing any game for a player is to use their card access
 * code to fetch the title_api_id corresponding to the game.
 */
export async function FetchMytTitleAPIID(
	userID: integer,
	game: Game,
	logger: KtLogger
): Promise<string> {
	const mytGame = GameToMytGame(game);

	if (mytGame === undefined) {
		throw new ScoreImportFatalError(500, `Unsupported game ${game}`);
	}

	const cardInfo = await db["myt-card-info"].findOne({ userID });

	if (!cardInfo) {
		throw new ScoreImportFatalError(401, `This user has no card info set up for this service.`);
	}

	const { cardAccessCode } = cardInfo;
	const hostname = GetMytHostname();

	const client = new CardsClient(hostname, credentials.createSsl());
	const req = new LookupRequest();

	req.setAccessCode(cardAccessCode);
	req.addTitles(mytGame);

	try {
		const response: LookupResponse = await UnaryRPCAsAsync(client.lookup.bind(client), req);

		for (const title of response.getTitlesList()) {
			if (title.getTitleKind() === mytGame) {
				return title.getTitleApiId();
			}
		}
	} catch (e) {
		const err = e as Error | ServiceError;

		if (errIsServiceError(err)) {
			if (err.code === Status.NOT_FOUND) {
				throw new ScoreImportFatalError(401, `Card not found on MYT: ${err.details}`);
			}

			logger.error(`Received unexpected status from ${hostname}`, {
				err,
				code: err.code,
				details: err.details,
				req: req.toObject(),
			});
			throw new ScoreImportFatalError(500, `Unexpected response from MYT - ${err.code}`);
		}

		logger.error(`Received invalid response`, { err });

		throw new ScoreImportFatalError(500, `Failed to look up card at MYT. Are they down?`);
	}

	throw new ScoreImportFatalError(
		400,
		`Couldn't find ${GetGameConfig(game).name} profile on MYT.`
	);
}
