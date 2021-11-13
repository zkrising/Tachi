import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";

const logger = CreateLogCtx("S3 Client");

let s3: null | S3Client = null;

if (ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE === "S3_BUCKET") {
	const data = ServerConfig.CDN_CONFIG.SAVE_LOCATION;
	logger.info(`Using S3_BUCKET as CDN location.`, { bootInfo: true });
	s3 = new S3Client({
		endpoint: data.ENDPOINT,
		region:
			data.REGION ?? "NO_REGION_BUT_YOU_HAVE_TO_SPECIFY_ONE_OTHERWISE_THIS_LIBRARY_ERRORS",
		credentials: {
			accessKeyId: data.ACCESS_KEY_ID,
			secretAccessKey: data.SECRET_ACCESS_KEY,
		},
	});
}

/**
 * Pushes a file to the configured S3 Bucket. Overwrites if already exists.
 */
export function PushToS3(path: string, content: Buffer | string) {
	logger.debug(`Saving content on S3 at ${path}.`);

	if (!s3 || ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE !== "S3_BUCKET") {
		logger.severe(
			`Attempted to push to S3, but CDN_CONFIG.SAVE_LOCATION.TYPE was not S3_BUCKET?`,
			ServerConfig.CDN_CONFIG
		);
		throw new Error(
			`Attempted to push to S3, but CDN_CONFIG.SAVE_LOCATION.TYPE was not S3_BUCKET?`
		);
	}

	return s3.send(
		new PutObjectCommand({
			Bucket: ServerConfig.CDN_CONFIG.SAVE_LOCATION.BUCKET,
			Key: (ServerConfig.CDN_CONFIG.SAVE_LOCATION.KEY_PREFIX ?? "") + path,
			Body: content,
		})
	);
}

/**
 * Deletes the provided file from the configured S3 bucket.
 */
export function DeleteFromS3(path: string) {
	if (!s3 || ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE !== "S3_BUCKET") {
		logger.severe(
			`Attempted to delete from S3, but CDN_CONFIG.SAVE_LOCATION.TYPE was not S3_BUCKET?`,
			ServerConfig.CDN_CONFIG
		);
		throw new Error(
			`Attempted to delete from S3, but CDN_CONFIG.SAVE_LOCATION.TYPE was not S3_BUCKET?`
		);
	}

	return s3.send(
		new DeleteObjectCommand({
			Bucket: ServerConfig.CDN_CONFIG.SAVE_LOCATION.BUCKET,
			Key: path,
		})
	);
}
