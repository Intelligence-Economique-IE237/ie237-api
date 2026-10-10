import { HTTPError } from "nitro";

export abstract class ApiError extends HTTPError {
	public abstract override status: number;
	constructor(public override message: string) {
		super(message);
	}
}
export class ContentAlreadyExistsError extends ApiError {
	status = 409;
	constructor(readonly slug: string) {
		super(`Content already exists with slug: ${slug}`);
	}
}
