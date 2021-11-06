/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import { TachiAPIClientDocument, UserAuthLevels } from "tachi-common";
import { Random20Hex } from "utils/misc";
import fjsh from "fast-json-stable-hash";
import CreateLogCtx from "lib/logger/logger";

const logger = CreateLogCtx(__filename);

type DefaultClients = Omit<TachiAPIClientDocument, "clientSecret" | "author">[];

// Defines some Tachi API Clients that should come default with a Tachi
// environment.
// These use the special Client ID prefix "CX" instead of "CI", which
// means they cannot possibly be collided.1
const KtchiDefaultClients: DefaultClients = [
	{
		name: "Fervidex",
		webhookUri: null,
		redirectUri: null,
		requestedPermissions: ["submit_score"],
		clientID: "CXFervidex",
		apiKeyFilename: "kamaitachi.fervidex.json",
		apiKeyTemplate: JSON.stringify(
			{
				url: `${ServerConfig.OUR_URL}/internal-api/ir/fervidex`,
				token: "%%TACHI_KEY%%",
			},
			null,
			"\t"
		),
	},
	{
		name: "Barbatos",
		webhookUri: null,
		redirectUri: null,
		requestedPermissions: ["submit_score"],
		clientID: "CXBarbatos",
		apiKeyFilename: "barbatos.json",
		apiKeyTemplate: JSON.stringify(
			{
				api_key: "%%TACHI_KEY%%",
			},
			null,
			"\t"
		),
	},
];

const BtchiDefaultClients: DefaultClients = [
	{
		name: "Beatoraja IR",
		webhookUri: null,
		redirectUri: null,
		requestedPermissions: ["submit_score"],
		clientID: "CXBeatorajaIR",
		apiKeyTemplate: null,
		apiKeyFilename: null,
	},
	{
		name: "USC IR",
		webhookUri: null,
		redirectUri: null,
		requestedPermissions: ["submit_score"],
		clientID: "CXUSCIR",
		apiKeyTemplate: null,
		apiKeyFilename: null,
	},
];

export async function LoadDefaultClients() {
	if (TachiConfig.TYPE === "ktchi") {
		await LoadClients(KtchiDefaultClients);
	} else if (TachiConfig.TYPE === "btchi") {
		await LoadClients(BtchiDefaultClients);
	} else {
		await LoadClients(KtchiDefaultClients);
		await LoadClients(BtchiDefaultClients);
	}
}

async function LoadClients(clients: DefaultClients) {
	const firstAdmin = await db.users.findOne({
		authLevel: UserAuthLevels.ADMIN,
	});

	if (!firstAdmin) {
		logger.error(
			`There are no admins on this instance of tachi-server. We cannot create default API Clients!`
		);
		return;
	}

	for (const client of clients) {
		const exists = await db["api-clients"].findOne(
			{
				clientID: client.clientID,
			},
			{
				projection: {
					clientSecret: 0,
					author: 0,
				},
			}
		);

		// Skip if nothing has changed.
		if (fjsh.hash(exists, "sha256") === fjsh.hash(client, "sha256")) {
			continue;
		}

		const realClient: TachiAPIClientDocument = {
			...client,
			clientSecret: `CS${Random20Hex()}`,
			author: 1,
		};

		// No replaceOne support in monk -- have to do this.
		await db["api-clients"].remove({
			clientID: client.clientID,
		});

		await db["api-clients"].insert(realClient);

		logger.info(`Loaded/Modified new built-in client ${client.name}.`);
	}
}
