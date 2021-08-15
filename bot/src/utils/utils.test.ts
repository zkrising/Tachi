import { Message } from "discord.js";
import { shouldReply } from "./utils";

// Mock Data
interface MockMessage {
	author: {
		id: string;
		bot: boolean;
	};
	channelId: string;
	content?: string;
}
const selfMessage: MockMessage = {
	author: {
		id: "876320894295887944",
		bot: true,
	},
	channelId: "876321394005254214"
};
const botMessage: MockMessage = {
	author: {
		id: "uniqueSnowflake",
		bot: true,
	},
	channelId: "876321394005254214"
};
const invalidChannel: MockMessage = {
	author: {
		id: "uniqueSnowflake",
		bot: false
	},
	channelId: "uniqueSnowflake"
};
const validMessage: MockMessage = {
	author: {
		id: "uniqueSnowflake",
		bot: false
	},
	channelId: "876321394005254214"
};

// Tests
describe("shouldReply", () => {
	test("should not reply to self", () => {
		expect(shouldReply(selfMessage as Message)).toEqual(false);
	});
	test("should not reply to a bot", () => {
		expect(shouldReply(botMessage as Message)).toEqual(false);
	});
	test("should not reply in an invalid channel", () => {
		expect(shouldReply(invalidChannel as Message)).toEqual(false);
	});
	test("should reply to a valid message", () => {
		expect(shouldReply(validMessage as Message)).toEqual(true);
	});
});
