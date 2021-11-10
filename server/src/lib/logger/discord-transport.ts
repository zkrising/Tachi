/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerConfig, TachiConfig } from "lib/setup/config";
import SafeJSONStringify from "safe-json-stringify";
import fetch from "utils/fetch";
import Transport, { TransportStreamOptions } from "winston-transport";
import { DiscordColours } from "./colours";
import { integer } from "tachi-common";
import { ONE_MINUTE } from "lib/constants/time";

interface DiscordTransportOptions extends TransportStreamOptions {
	/** Webhook obtained from Discord */
	webhook: string;
}

interface LogLevelCountState {
	warn: integer;
	error: integer;
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
	private initalised: Promise<void>;

	private bucketData: LogLevelCountState = {
		warn: 0,
		error: 0,
	};

	private isBucketing = false;

	constructor(opts: DiscordTransportOptions) {
		super(opts);

		this.resetBucketData();

		this.initalised = fetch(opts.webhook)
			.then((r) => {
				if (!r.ok) {
					throw new Error(`Couldn't connect to discord transport. ${r.status}.`);
				}

				return r.json();
			})
			.then((content) => {
				this.webhookUrl = `https://discordapp.com/api/v6/webhooks/${content.id}/${content.token}`;
			});
	}

	private resetBucketData() {
		this.bucketData = {
			warn: 0,
			error: 0,
		};
	}

	log(info: any, cb: () => void) {
		if (info.noDiscord !== false) {
			try {
				setImmediate(() => {
					this.initalised.then(() => {
						this.handleSendToDiscord(info);
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

	private handleSendToDiscord(info: any) {
		if (info.level === "crit" || info.level === "severe") {
			return this.sendLogDirectlyToDiscord(info);
		}

		if (!["warn", "error", "severe"].includes(info.level)) {
			// Don't need to send notifications about these.
			return;
		}

		this.bucketData[info.level as "warn" | "error"] += 1;

		if (!this.isBucketing) {
			this.isBucketing = true;
			setTimeout(() => {
				this.sendBucketData();
			}, ONE_MINUTE);
		}
	}

	private getWhoToTag() {
		return ServerConfig.LOGGER_CONFIG.DISCORD!.WHO_TO_TAG
			? ServerConfig.LOGGER_CONFIG.DISCORD!.WHO_TO_TAG.map((e) => `<@${e}>`).join(" ")
			: "Nobody configured to tag, but this is bad, get someone!";
	}

	private sendBucketData() {
		let color = 0;

		for (const key of ["warn", "error"] as const) {
			if (this.bucketData[key]) {
				color = DiscordColours[key];
			}
		}

		const postBody = {
			content: "",
			embeds: [
				{
					title: `${TachiConfig.NAME} Log Summary`,
					fields: Object.entries(this.bucketData).map(([k, v]) => ({
						name: k[0].toUpperCase() + k.slice(1) + (v === 1 ? "" : "s"),
						value: v.toString(),
					})),
					description: `Log summary for ${new Date().toUTCString()}.`,
					color,
					timestamp: new Date().toISOString(),
				},
			],
		};

		this.POSTData(postBody);
		this.resetBucketData();
		this.isBucketing = false;
	}

	private async sendLogDirectlyToDiscord(info: any) {
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
			const content = await res.json();

			// Try and retry when they say so. The issue is that our logging
			// is very async, and this is a billion race conditions.
			// It's possible that messages here could all get stuck in an
			// awful loop, so we have a tuning off parameter.
			// The scaleRetryDebouncer will get squared every call,
			// so the initial request takes 2 * (generally 1milisecond),
			// then following requests will take even longer...
			// It's possible this might blow up in our face.
			// We'll have to see. - zkldi 2021/09/17

			if (content.retry_after) {
				setTimeout(() => {
					this.POSTData(postBody, scaleRetryDebounce ** 2);
				}, content.retry_after * scaleRetryDebounce);
			}
		} else if (!res.ok) {
			// eslint-disable-next-line no-console
			console.error(`Failed to send to discord ${res.status} ${await res.text()}`);
		}
	}
}
