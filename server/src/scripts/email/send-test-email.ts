import { Command } from "commander";
import { SendEmail } from "lib/email/client";
import { MainHTMLWrapper } from "lib/email/formats";
import CreateLogCtx from "lib/logger/logger";

const program = new Command();

program.option("-e, --email <Email to send to>");

const logger = CreateLogCtx(__filename);

program.parse(process.argv);
const options: { email?: string } = program.opts();

if (!options.email) {
	throw new Error(`Need an --email to send to.`);
}

if (require.main === module) {
	(async () => {
		logger.info(`Sending email to ${options.email}.`);
		await SendEmail(
			options.email!,
			"Hello World",
			MainHTMLWrapper("Hello world! This is a test email for doing things."),
			"Hello world! This is a test email for doing things."
		);
		logger.info(`Done.`);

		process.exit(0);
	})().catch((err: unknown) => {
		logger.error(`Failed to send test email.`, { err });

		process.exit(1);
	});
}
