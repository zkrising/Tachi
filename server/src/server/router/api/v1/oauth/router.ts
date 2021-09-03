import { Router } from "express";
import db from "external/mongo/db";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { Random20Hex } from "utils/misc";
import clientsRouter from "./clients/router";

const router: Router = Router({ mergeParams: true });

/**
 * Converts an auth code into a valid API key that is returned.
 *
 * @note The params here are deliberately snake cased as that's what
 * the digitalocean examples for oauth2 do. I have no idea whether that's
 * part of the spec or not, but it probably is.
 *
 * @param client_id - The id for the client requesting a token.
 * @param client_secret - The secret for the client.
 * @param grant_type - Only exactly "authorization_code" is supported at the moment.
 * @param redirect_uri - Must be the exact redirectUri registered with this client.
 * @param code - The code to convert into an API token.
 *
 * @name POST /api/v1/oauth/token
 */
router.post(
	"/token",
	prValidate({
		client_id: "string",
		client_secret: "string",
		grant_type: p.is("authorization_code"),
		redirect_uri: "string",
		code: "string",
	}),
	async (req, res) => {
		const client = await db["oauth2-clients"].findOne({
			clientID: req.body.client_id,
		});

		if (!client) {
			return res.status(404).json({
				success: false,
				description: `This client does not exist.`,
			});
		}

		if (client.clientSecret !== req.body.client_secret) {
			return res.status(403).json({
				success: false,
				description: `Invalid secret.`,
			});
		}

		// I honest to god have no idea what the point of this check is
		// but it's part of the oauth spec.
		if (client.redirectUri !== req.body.redirect_uri) {
			return res.status(400).json({
				success: false,
				description: `This redirect_uri does not match with your registered client redirect_uri ${client.redirectUri}.`,
			});
		}

		const codeDoc = await db["oauth2-auth-codes"].findOne({ code: req.body.code });

		if (!codeDoc) {
			return res.status(404).json({
				success: false,
				description: `This code does not exist.`,
			});
		}

		const apiDoc = {
			userID: codeDoc.userID,
			token: Random20Hex(),
			identifier: `${client.name} Token`,
			// converts ["a","b"] to {a: true, b: true}.
			permissions: Object.fromEntries(client.requestedPermissions.map((e) => [e, true])),
			fromOAuth2Client: client.clientID,
		};

		// Now we can actually register the api key (lol)
		await db["api-tokens"].insert(apiDoc);

		return res.status(200).json({
			success: true,
			description: `Successfully authenticated.`,
			body: apiDoc,
		});
	}
);

/**
 * Creates an authorization code for this user (inferred from session).
 *
 * @name POST /api/v1/oauth/create-code
 */
router.post("/create-code", async (req, res) => {
	if (!req.session.tachi?.user) {
		return res.status(401).json({
			success: false,
			description: `You are not authenticated.`,
		});
	}

	const code = Random20Hex();

	const doc = { code, userID: req.session.tachi.user.id, createdOn: Date.now() };

	await db["oauth2-auth-codes"].insert(doc);

	return res.status(200).json({
		success: true,
		description: `Successfully created code.`,
		body: doc,
	});
});

router.use("/clients", clientsRouter);

export default router;
