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
	StatusObject,
	ServiceError,
} from "@grpc/grpc-js";
import type { KtLogger } from "lib/logger/logger";
import type { LookupResponse } from "proto/generated/cards/cards_pb";
import type { PlaylogStreamItem } from "proto/generated/wacca/user_pb";
import type { Game } from "tachi-common";

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

export function UnaryRPCAsAsync<TIn, TOut>(
	unaryCall: (argument: TIn, metadata: Metadata, callback: requestCallback<TOut>) => void,
	argument: TIn
): Promise<TOut> {
	return new Promise((resolve, reject) => {
		unaryCall(argument, CreateAuthenticatedMetadata(), (error, value) => {
			if (error) {
				reject(error);
			}

			resolve(value!);
		});
	});
}

export async function* StreamRPCAsAsync<TIn, TOut>(
	streamingCall: (argument: TIn, metadata: Metadata) => ClientReadableStream<TOut>,
	argument: TIn,
	logger: KtLogger
): AsyncIterable<TOut> {
	const stream = streamingCall(argument, CreateAuthenticatedMetadata());

	// Convert the callback hell to an AsyncIterable - this is kind of garbage but seems like the best way
	let resolve: (_: unknown) => void;
	let reject: (err: Error) => void;
	const data: Array<TOut> = [];
	let closed = false;

	stream.on("data", (chunk) => {
		if (!closed) {
			logger.warn((chunk as PlaylogStreamItem).getInfo()?.getMusicId());
			data.push(chunk);
			resolve(null);
		} else {
			logger.warn(`ended but ${(chunk as PlaylogStreamItem).getInfo()?.getMusicId()}`);
		}
	});

	stream.on("end", () => {
		closed = true;
		resolve(null);
	});

	stream.on("error", (err) => {
		reject(err);
	});

	stream.on("status", (status: StatusObject) => {
		logger.warn("discarding status from grpc stream", status);
		// discard
	});

	// next is modified by the callbacks above. Each event will either throw
	// an exception (by calling reject), or update next before resolving the
	// Promise.
	// eslint-disable-next-line no-unmodified-loop-condition
	while (!closed) {
		// The loop handling here is messy and non-standard, but intentional.
		// Each iteration through the loop creates a Promise that we can await,
		// then assigns the function-scoped resolve and reject functions so
		// that this promise will resolve once we receive new data (or the
		// stream closes/errors).
		// eslint-disable-next-line @typescript-eslint/no-loop-func
		const newData = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
			setTimeout(rej, 5000, new Error("Stream handling timed out"));
		});

		while (data.length > 0) {
			yield data.shift()!;
		}

		// eslint-disable-next-line no-await-in-loop
		await newData;
	}

	while (data.length > 0) {
		yield data.shift()!;
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
