import bunyan from "bunyan";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig } from "lib/setup/config";
import nodemailer from "nodemailer";
import type { SentMessageInfo, Transporter } from "nodemailer";

const logger = CreateLogCtx(__filename);

let transporter: Transporter | undefined;

if (ServerConfig.EMAIL_CONFIG) {
	logger.info(`Connecting to email server...`, { bootInfo: true });
	const conf = ServerConfig.EMAIL_CONFIG;

	try {
		transporter = nodemailer.createTransport({
			newline: "unix",
			logger: conf.TRANSPORT_OPS?.debug
				? bunyan.createLogger({ name: "Email Logger" })
				: undefined,
			...(conf.TRANSPORT_OPS ?? {}),
		});

		transporter.verify((err) => {
			if (err) {
				logger.crit(`Could not connect to email server.`, { err });
				throw err;
			} else {
				logger.info(`Successfully connected to email server.`, { bootInfo: true });
			}
		});
	} catch (err) {
		logger.crit(`Failed to create email client.`, { err });
		throw err;
	}
} else {
	logger.warn(`No EMAIL_CONFIG present in conf, emails will not be sent from the server.`, {
		bootInfo: true,
	});
}

export function SendEmail(
	to: string,
	subject: string,
	htmlContent: string,
	textContent: string
): Promise<SentMessageInfo> | undefined {
	if (Environment.nodeEnv === "test") {
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
		subject,
		html: htmlContent,
		text: textContent,
		dkim: ServerConfig.EMAIL_CONFIG?.DKIM,
	});
}
