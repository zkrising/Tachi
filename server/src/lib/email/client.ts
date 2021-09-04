import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import nodemailer, { SentMessageInfo, Transporter } from "nodemailer";

const logger = CreateLogCtx(__filename);

let transporter: Transporter | undefined;

if (ServerConfig.EMAIL_CONFIG) {
	logger.info(`Connecting to email server...`);
	const conf = ServerConfig.EMAIL_CONFIG;

	try {
		transporter = nodemailer.createTransport({
			sendmail: true,
			newline: "unix",
			path: conf.SENDMAIL_BIN ?? "/usr/bin/sendmail",
		});

		transporter.verify((err) => {
			if (err) {
				logger.crit(`Could not connect to email server.`, { err });
				throw err;
			} else {
				logger.info(`Successfully connected to email server.`);
			}
		});
	} catch (err) {
		logger.crit(`Failed to create email client.`, { err });
		throw err;
	}
} else {
	logger.warn(`No EMAIL_CONFIG present in conf, emails will not be sent from the server.`);
}

export function SendEmail(to: string, htmlContent: string): Promise<SentMessageInfo> | undefined {
	if (process.env.NODE_ENV === "test") {
		logger.debug(`Stubbed out SendEmail as env was test.`);
		return;
	}

	if (!transporter) {
		logger.debug(`Stubbed out SendEmail as no EMAIL_CONFIG was set.`);
		return;
	}

	logger.verbose(`Sending email to ${to}.`);

	return transporter.sendMail({
		from: ServerConfig.EMAIL_CONFIG!.FROM,
		to,
		html: htmlContent,
	});
}
