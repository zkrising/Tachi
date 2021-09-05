import redis from "redis";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";

/**
 * This code has been stubbed out! It doesn't really have a use at the moment.
 * At some point, though, we might actually need this. (Maybe for a logging framework)
 *
 * This was used to communicate with other processes running on the same host as this server.
 * The idea was the use it for the discord bot, however, we have webhooks now that do this (better).
 * Thanks!
 */

const logger = CreateLogCtx(__filename);

// Stub types. In the future, we may actually use this.
export type RedisIPCChannels = "";
export type RedisIPCData = {
	"": unknown;
};

type RedisSubCallback<T extends RedisIPCChannels> = (data: RedisIPCData[T]) => void;

type SubCallbacks = {
	[K in RedisIPCChannels]: RedisSubCallback<K>[];
};

const SubCallbacks: Partial<SubCallbacks> = {};

// Redis doesn't allow one client to subscribe and publish
// There's little to no overhead to having these three clients,
// so - that's why its like this.
const SubClient = redis.createClient();
const PubClient = redis.createClient();

const PREFIX = ServerConfig.TYPE.toUpperCase(); // KTCHI or BTCHI

export function RedisPub<T extends RedisIPCChannels>(channel: T, data: RedisIPCData[T]) {
	PubClient.publish(`${PREFIX}-${channel}`, JSON.stringify(data));
}

export function RedisSub<T extends RedisIPCChannels>(channel: T, callback: RedisSubCallback<T>) {
	if (SubCallbacks[channel]) {
		// @ts-expect-error It's complaining that the T in channel might be a different T to the T in callback
		// this is obviously nonsense.
		SubCallbacks[channel]!.push(callback);
		logger.debug(`Pushed callback ${callback.name} to channel ${channel}.`);
	} else {
		// @ts-expect-error see above.
		SubCallbacks[channel] = [callback];
		SubClient.subscribe(`${PREFIX}-${channel}`);
		logger.debug(`Added first callback ${callback.name} to channel ${channel}.`);
	}
}

SubClient.on("message", (channel, strData) => {
	if (!channel.startsWith(`${PREFIX}-`)) {
		return; // not our business
	}

	const ktChannel = channel.slice(`${PREFIX}-`.length) as RedisIPCChannels;

	if (!Object.prototype.hasOwnProperty.call(SubCallbacks, ktChannel)) {
		return; // no callbacks to call
	}

	const jsData = JSON.parse(strData);

	for (const cb of SubCallbacks[ktChannel]!) {
		try {
			cb(jsData);
		} catch (err) {
			logger.error(`Error calling callback ${cb.name} for channel ${ktChannel}`, { err });
		}
	}
});

// Awful...
// Function is near-impossible to test.
/* istanbul ignore next */
export function CloseRedisPubSub() {
	return new Promise<void>((resolve, reject) => {
		PubClient.quit((err) => {
			if (err) {
				logger.crit(`PubClient QUIT error: ${err}`, { err });
				reject(err);
			}

			SubClient.quit((err) => {
				if (err) {
					logger.crit(`SubClient QUIT error: ${err}`, { err });
					reject(err);
				}

				resolve();
			});
		});
	});
}
