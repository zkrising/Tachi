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
			PORT: (self) =>
				p.isPositiveInteger(Number(self)) === true ||
				"Should be a string representing a whole integer port.",
			CLIENT_SECRET: "string",
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
		clientSecret: process.env.CLIENT_SECRET!,
	};
}

export const ProcessEnv = ParseEnvVars();
