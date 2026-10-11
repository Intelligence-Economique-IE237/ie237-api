import { HTTPError } from "nitro";

export abstract class ApiError extends HTTPError {
	public abstract override status: number;
	constructor(public override message: string = "") {
		super(message);
	}
}

export class ContentAttachmentConflictError extends ApiError {
	status = 409;
	constructor(
		readonly attachementId: string,
		readonly contentId: string,
	) {
		super(
			`Content: ${contentId} already has an attachment: ${attachementId}`,
		);
	}
}

export class ContentAttachmentNotFoundError extends ApiError {
	status = 404;
	constructor(
		readonly attachementId: string,
		readonly contentId: string,
	) {
		super(
			`Content: ${contentId} does not have the attachment: ${attachementId}`,
		);
	}
}

export class ContentNotFoundError extends ApiError {
	status = 409;
	constructor(readonly contentId: string) {
		super(`Content does not exist with ID: ${contentId}`);
	}
}
export class ContentAlreadyExistsError extends ApiError {
	status = 409;
	constructor(readonly slug: string) {
		super(`Content already exists with slug: ${slug}`);
	}
}
