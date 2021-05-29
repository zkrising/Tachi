import redis from "redis";
import { RedisIPCChannels, RedisIPCData } from "kamaitachi-common";
import CreateLogCtx from "../../lib/logger/logger";

const logger = CreateLogCtx(__filename);

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

const PREFIX = "KTBSV";

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
    if (!channel.startsWith("KTBSV-")) {
        return; // not our business
    }

    const ktChannel = channel.slice("KTBSV-".length) as RedisIPCChannels;

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
export function CloseRedisPubSub() {
    return new Promise<void>((resolve, reject) => {
        PubClient.quit((err) => {
            if (err) {
                reject(err);
            }

            SubClient.quit((err) => {
                if (err) {
                    reject(err);
                }

                resolve();
            });
        });
    });
}
