import type { H3Event } from "nitro";
import {
	getValidatedQuery,
	getValidatedRouterParams,
	HTTPError,
	readBody,
} from "nitro/h3";
import {
	adjectives,
	animals,
	colors,
	uniqueNamesGenerator,
} from "unique-names-generator";
import z from "zod";

export async function validateBodyZod<TSchema extends z.ZodObject>(
	event: H3Event,
	schema: TSchema,
) {
	const body = await readBody(event);
	const { data, error, success } = schema.safeParse(body);
	if (!success) throw new HTTPError(z.prettifyError(error), { status: 400 });
	return data;
}
export async function validateQueryZod<TSchema extends z.ZodObject>(
	event: H3Event,
	schema: TSchema,
) {
	const { data, error, success } = await getValidatedQuery(
		event,
		schema.safeParse,
	);

	if (!success) throw new HTTPError(z.prettifyError(error), { status: 400 });
	return data;
}

export async function validateRouterZod<TSchema extends z.ZodObject>(
	event: H3Event,
	schema: TSchema,
) {
	const { data, error, success } = await getValidatedRouterParams(
		event,
		schema.safeParse,
	);
	if (!success) throw new HTTPError(z.prettifyError(error), { status: 400 });
	return data;
}

// const customConfig: Config = {
// 	dictionaries: [adjectives, colors],
// 	separator: "-",
// 	length: 2,
// };

export const randomName: string = uniqueNamesGenerator({
	dictionaries: [adjectives, colors, animals],
});
