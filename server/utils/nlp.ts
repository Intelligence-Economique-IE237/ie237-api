import { detect } from "tinyld/light";

export function determineLanguage(text: string) {
	return detect(text);
}
