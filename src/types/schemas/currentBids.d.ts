/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type CurrentBids = {
	id: number;
	name: string;
	description?: string;
	goal?: number | null;
	total: number;
	state: string;
	speedrunEndTime?: string | null;
	speedrunName?: string | null;
	userOptionsAllowed?: boolean;
	options?: {
		name: string;
		description?: string;
		total: number;
	}[];
}[];
