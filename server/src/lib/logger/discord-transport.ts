/* eslint-disable @typescript-eslint/no-explicit-any */
import { DiscordColours } from "./colours";
import { ONE_MINUTE } from "lib/constants/time";
import { Environment, ServerConfig, TachiConfig } from "lib/setup/config";
import SafeJSONStringify from "safe-json-stringify";
import fetch from "utils/fetch";
import { IsRecord } from "utils/misc";
import Transport from "winston-transport";
import type { TransportStreamOptions } from "winston-transport";

interface DiscordTransportOptions extends TransportStreamOptions {
	webhook: string;
}

interface LogLevelCountState {
	warn: Array<string>;
	error: Array<string>;
}

interface LoggerInfo {
	level: "crit" | "debug" | "info" | "severe" | "verbose" | "warn";
	message: string;
	noDiscord?: boolean;
	meta?: Record<string, any>;
}

/**
 * Creates a discord winston transport. This is a slightly adapted version
 * of sidhantpanda's winston-discord-transport, modified for our use case.
 *
 * @param webhookUrl The webhook to connect to.
 * @returns A winston tranport.
 */
export default class DiscordTransport extends Transport {
	private webhookUrl = "";

	/** Initialization promise resolved after retrieving discord id and token */
	private readonly initalised: Promise<void>;

	private bucketData: LogLevelCountState = {
		warn: [],
		error: [],
	};

	private isBucketing = false;
	private bucketStart: Date | null = null;

	constructor(opts: DiscordTransportOptions) {
		super(opts);

		this.resetBucketData();

		this.initalised = fetch(opts.webhook)
			.then((r) => {
				if (!r.ok) {
					throw new Error(`Couldn't connect to discord transport. ${r.status}.`);
				}

				return r.json() as unknown;
			})
			.then((content) => {
				if (!IsRecord(content)) {
					throw new Error(
						`Discord returned non-object data as JSON? Can't get id or token ${content}.`
					);
				}

				this.webhookUrl = `https://discordapp.com/api/v6/webhooks/${content.id}/${content.token}`;
			});
	}

	private resetBucketData() {
		this.bucketData = {
			warn: [],
			error: [],
		};
	}

	log(info: LoggerInfo, cb: () => void) {
		if (info.noDiscord !== false) {
			try {
				setImmediate(() => {
					void this.initalised.then(() => {
						void this.handleSendToDiscord(info);
					});
				});
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error(`Failed to send content to discord transport`, err);
			}
		}

		// don't bother waiting around.
		cb();
	}

	private handleSendToDiscord(info: LoggerInfo) {
		if (info.level === "crit" || info.level === "severe") {
			return this.sendLogDirectlyToDiscord(info);
		}

		if (!["warn", "error", "severe"].includes(info.level)) {
			// Don't need to send notifications about these.
			return;
		}

		this.bucketData[info.level as "error" | "warn"].push(info.message);

		if (!this.isBucketing) {
			this.isBucketing = true;
			this.bucketStart = new Date();
			setTimeout(() => {
				this.sendBucketData();
			}, ONE_MINUTE);
		}
	}

	private getWhoToTag() {
		return ServerConfig.LOGGER_CONFIG.DISCORD?.WHO_TO_TAG
			? ServerConfig.LOGGER_CONFIG.DISCORD.WHO_TO_TAG.map((e) => `<@${e}>`).join(" ")
			: "Nobody configured to tag, but this is bad, get someone!";
	}

	private sendBucketData() {
		let color = 0;

		const fields = [];

		for (const key of ["warn", "error"] as const) {
			if (this.bucketData[key].length !== 0) {
				color = DiscordColours[key];
				fields.push({
					// uppercase first char
					name: `${key[0]!.toUpperCase()}${key.slice(1)}s`,
					value: this.bucketData[key].length,
				});
			}
		}

		const logSnippet = [
			...this.bucketData.error.map((e) => `[ERROR] ${e}`),
			...this.bucketData.warn.map((e) => `[WARN] ${e}`),
		].join("\n");

		const postBody = {
			content: `
			\`\`\`${logSnippet.length > 1500 ? `${logSnippet.slice(0, 1500 - 3)}...` : logSnippet}\`\`\``,
			embeds: [
				{
					title: `${TachiConfig.NAME} Log Summary${
						Environment.replicaIdentity
							? ` (Replica: ${Environment.replicaIdentity})`
							: ""
					}`,
					fields,
					description: `Log summary for ${this.bucketStart?.toISOString()} to ${new Date().toISOString()}.`,
					color,
					timestamp: new Date().toISOString(),
				},
			],
		};

		void this.POSTData(postBody);
		this.resetBucketData();
		this.isBucketing = false;
		this.bucketStart = null;
	}

	private async sendLogDirectlyToDiscord(info: LoggerInfo) {
		const postBody = {
			content: "",
			embeds: [
				{
					description: `[${info.level}] ${info.message}`,

					// it's Colour!!
					color: DiscordColours[info.level as keyof typeof DiscordColours],
					timestamp: new Date().toISOString(),
				},
			],
		};

		if (info.meta) {
			postBody.content = `\`\`\`${SafeJSONStringify(info.meta, null, 4)}\`\`\``;
		}

		// These two levels are bad, and require near-immediate attention.

		if (info.level === "severe") {
			postBody.content = `SEVERE ERROR: ${this.getWhoToTag()}\n${postBody.content}`;
		}

		if (info.level === "crit") {
			postBody.content = `CRITICAL ERROR: ${this.getWhoToTag()}\n${postBody.content}`;
		}

		await this.POSTData(postBody);
	}

	private async POSTData(postBody: unknown, scaleRetryDebounce = 2) {
		const res = await fetch(this.webhookUrl, {
			method: "POST",
			body: JSON.stringify(postBody),
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (res.status === 429) {
			// being rate limited.
			const content = (await res.json()) as unknown;

			// Try and retry when they say so. The issue is that our logging
			// is very async, and this is a billion race conditions.
			// It's possible that messages here could all get stuck in an
			// awful loop, so we have a tuning off parameter.
			// The scaleRetryDebouncer will get squared every call,
			// so the initial request takes 2 * (generally 1milliseconds),
			// then following requests will take even longer...
			// It's possible this might blow up in our face.
			// We'll have to see. - zkldi 2021/09/17

			if (IsRecord(content) && typeof content.retry_after === "number") {
				setTimeout(() => {
					void this.POSTData(postBody, scaleRetryDebounce ** 2);
				}, content.retry_after * scaleRetryDebounce);
			}
		} else if (!res.ok) {
			// eslint-disable-next-line no-console
			console.error(`Failed to send to discord ${res.status} ${await res.text()}`);
		}
	}
}
