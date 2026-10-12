import { Client } from "minio";
import { useRuntimeConfig } from "nitro/runtime-config";
import { fileURLToPath } from "url";
import { useLogger } from "./logging";

let client: Client;
export async function initStorage() {
	if (!client) {
		const {
			minioHost,
			minioPort,
			minioUseSsl,
			minioAccessKey,
			minioSecretKey,
		} = useRuntimeConfig();
		const logger = useLogger({
			module: "storage-starter",
			modulePath: fileURLToPath(import.meta.url),
		});
		logger.debug("creating storage client");
		client = new Client({
			endPoint: minioHost,
			port: minioPort,
			accessKey: minioAccessKey,
			secretKey: minioSecretKey,
			useSSL: minioUseSsl === "true",
		});
		logger.debug("storage client ready, asserting bucket");
		const { minioBucket } = useRuntimeConfig();
		await assertBucket(minioBucket);
		logger.debug("bucket asserted successfully");
	}
}

export function useStorage() {
	return client;
}

export async function assertBucket(name: string) {
	if (await client.bucketExists(name)) return;
	await client.makeBucket(name);
}

export async function prepareUploadURL(
	objectName: string,
	lifetime = 24 * 3_600 * 7,
) {
	const { minioBucket } = useRuntimeConfig();
	const url = await client.presignedPutObject(
		minioBucket,
		objectName,
		lifetime,
	);
	return { url, method: "PUT" };
}
