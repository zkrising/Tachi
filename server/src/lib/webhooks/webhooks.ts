import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { WebhookEvents } from "tachi-common";

const logger = CreateLogCtx(__filename);

// @todo make use of aggressive caching here?
export async function GetWebhookUrlInfo() {
	const urls = await db["oauth2-clients"].find(
		{ webhookUri: { $ne: null } },
		{ projection: { webhookUri: 1, clientSecret: 1 } }
	);

	return urls;
}

/**
 * Emits a webhook event to all registered client webhooks on this tachi-server install.
 */
export async function EmitWebhookEvent(content: WebhookEvents) {
	const webhookUrls = await GetWebhookUrlInfo();

	logger.verbose(`Emitting webhook event ${content.type} to ${webhookUrls.length} clients.`);

	// We don't actually care about the response of these. Just fire them and forget.
	for (const client of webhookUrls) {
		// we know this to be non-null because of GetWebhookUrlInfo.
		fetch(client.webhookUri!, {
			method: "POST",
			body: JSON.stringify(content),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${client.clientSecret}`,
			},
		});
	}
}
