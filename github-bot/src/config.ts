import { config } from "dotenv";
import p from "prudence";

// init dotenv
config();

function ParseEnvVars() {
	const err = p(
		process.env,
		{
			APP_ID: "string",
			WEBHOOK_SECRET: "string",
			BASE64_PRIVATE_KEY: "string",
			PORT: (self) =>
				p.isPositiveInteger(Number(self)) === true ||
				"Should be a string representing a whole integer port.",
			CLIENT_SECRET: "string",
			CLIENT_ID: "string",
		},
		{},
		{ allowExcessKeys: true }
	);

	if (err) {
		throw new Error(`${err.keychain}: ${err.message}`);
	}

	return {
		appId: process.env.APP_ID!,
		webhookSecret: process.env.WEBHOOK_SECRET!,
		port: process.env.PORT!,
		privateKey: Buffer.from(process.env.BASE64_PRIVATE_KEY!, "base64").toString("utf-8"),
		clientID: process.env.CLIENT_ID!,
		clientSecret: process.env.CLIENT_SECRET!,
	};
}

export const ProcessEnv = ParseEnvVars();
