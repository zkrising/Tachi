import { UpdateUsersQuests } from "./quests";
import deepmerge from "deepmerge";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import t from "tap";
import ResetDBState from "test-utils/resets";
import { TestingIIDXSPQuest } from "test-utils/test-data";
import type { GoalImportInfo } from "tachi-common";

const logger = CreateLogCtx(__filename);

function CreateMockGII(...garr: Array<[string, boolean]>) {
	return garr.map((e) => ({
		goalID: e[0],
		old: {},
		new: { achieved: e[1] },
	})) as unknown as Array<GoalImportInfo>;
}

t.test("#UpdateUsersQuests", (t) => {
	t.beforeEach(ResetDBState);
	t.beforeEach(() => db.quests.insert(TestingIIDXSPQuest));
	t.beforeEach(() =>
		db["quest-subs"].insert({
			achieved: false,
			wasInstantlyAchieved: false,
			game: "iidx",
			questID: TestingIIDXSPQuest.questID,
			playtype: "SP",
			progress: 0,
			timeAchieved: null,
			lastInteraction: null,
			userID: 1,
		})
	);

	t.test("Test with clean achieved quest.", async (t) => {
		const res = await UpdateUsersQuests(
			CreateMockGII(
				["eg_goal_1", true],
				["eg_goal_2", true],
				["eg_goal_3", true],
				["eg_goal_4", true]
			),
			"iidx",
			["SP"],
			1,
			logger
		);

		t.strictSame(
			res,
			[
				{
					questID: "example_quest_id",
					old: {
						progress: 0,
						achieved: false,
					},
					new: {
						progress: 4,
						achieved: true,
					},
				},
			],
			"Should correctly assert the quest is achieved."
		);

		t.end();
	});

	t.test("Test with unclean achieved quest.", async (t) => {
		const res = await UpdateUsersQuests(
			CreateMockGII(
				["eg_goal_1", true],
				["eg_goal_2", true],
				["eg_goal_3", true],
				["eg_goal_4", true],
				["x_goal_1", true],
				["x_goal_2", true],
				["x_goal_3", true]
			),
			"iidx",
			["SP"],
			1,
			logger
		);

		t.strictSame(
			res,
			[
				{
					questID: "example_quest_id",
					old: {
						progress: 0,
						achieved: false,
					},
					new: {
						progress: 4,
						achieved: true,
					},
				},
			],
			"Should correctly assert the quest is achieved."
		);

		t.end();
	});

	t.test("Test with increased progress on quest.", async (t) => {
		const res = await UpdateUsersQuests(
			CreateMockGII(["eg_goal_1", true], ["eg_goal_2", true]),
			"iidx",
			["SP"],
			1,
			logger
		);

		t.strictSame(
			res,
			[
				{
					questID: "example_quest_id",
					old: {
						progress: 0,
						achieved: false,
					},
					new: {
						progress: 2,
						achieved: false,
					},
				},
			],
			"Should correctly assert the quest progress has increased."
		);

		t.end();
	});

	t.test("Test with no new goals on quest.", async (t) => {
		const res = await UpdateUsersQuests([], "iidx", ["SP"], 1, logger);

		t.strictSame(res, [], "Should correctly return no changes.");

		t.end();
	});

	t.test("Test with new goals on multiple quests.", async (t) => {
		delete TestingIIDXSPQuest._id;
		await db.quests.insert(
			// eslint-disable-next-line lines-around-comment
			// @ts-expect-error lol
			deepmerge(TestingIIDXSPQuest, {
				questID: "some_other_quest_with_mutual_goals",
			})
		);
		await db["quest-subs"].insert({
			achieved: false,
			wasInstantlyAchieved: false,
			game: "iidx",
			questID: "some_other_quest_with_mutual_goals",
			playtype: "SP",
			progress: 0,
			timeAchieved: null,
			lastInteraction: null,
			userID: 1,
		});

		const res = await UpdateUsersQuests(
			CreateMockGII(
				["eg_goal_1", true],
				["eg_goal_2", true],
				["eg_goal_3", true],
				["eg_goal_4", true],
				["x_goal_1", true],
				["x_goal_2", true],
				["x_goal_3", true]
			),
			"iidx",
			["SP", "DP"],
			1,
			logger
		);

		t.strictSame(
			res,
			[
				{
					questID: "example_quest_id",
					old: {
						progress: 0,
						achieved: false,
					},
					new: {
						progress: 4,
						achieved: true,
					},
				},
				{
					questID: "some_other_quest_with_mutual_goals",
					old: {
						progress: 0,
						achieved: false,
					},
					new: {
						progress: 4,
						achieved: true,
					},
				},
			],
			"Should correctly assert the quests are achieved."
		);
		t.end();
	});

	t.test("Test with multiple quests that only some match", async (t) => {
		delete TestingIIDXSPQuest._id;
		await db.quests.insert([
			// @ts-expect-error lol
			deepmerge(TestingIIDXSPQuest, {
				questID: "some_other_quest_with_mutual_goals",
			}),
			deepmerge(
				TestingIIDXSPQuest,
				{
					questID: "dp_quest",
					playtype: "DP",
					questData: [
						{
							goals: [{ goalID: "foobar" }],
						},
					],
				},
				{ arrayMerge: (d, s) => s }
			),
			deepmerge(
				TestingIIDXSPQuest,
				{
					questID: "other_game_quest",
					game: "museca",
					playtype: "Single",
					questData: [
						{
							goals: [{ goalID: "foo" }],
						},
					],
				},
				{ arrayMerge: (d, s) => s }
			),
			deepmerge(
				TestingIIDXSPQuest,
				{
					questID: "iidx_with_not_goal",
					game: "iidx",
					playtype: "SP",
					questData: [
						{
							goals: [{ goalID: "not_real_goal_id" }],
						},
					],
				},
				{ arrayMerge: (d, s) => s }
			),
		]);

		await db["quest-subs"].insert([
			{
				achieved: false,
				wasInstantlyAchieved: false,
				game: "iidx",
				questID: "some_other_quest_with_mutual_goals",
				playtype: "SP",
				progress: 0,
				timeAchieved: null,
				lastInteraction: null,
				userID: 1,
			},
			{
				achieved: false,
				wasInstantlyAchieved: false,

				game: "iidx",
				questID: "dp_quest",
				playtype: "DP",
				progress: 0,
				timeAchieved: null,
				lastInteraction: null,
				userID: 1,
			},
			{
				achieved: false,
				wasInstantlyAchieved: false,

				game: "museca",
				questID: "other_game_quest",
				playtype: "Single",
				progress: 0,
				timeAchieved: null,
				lastInteraction: null,
				userID: 1,
			},
			{
				achieved: false,
				wasInstantlyAchieved: false,
				game: "iidx",
				questID: "iidx_with_not_goal",
				playtype: "SP",
				progress: 0,
				timeAchieved: null,
				lastInteraction: null,
				userID: 1,
			},
		]);

		const res = await UpdateUsersQuests(
			CreateMockGII(
				["eg_goal_1", true],
				["eg_goal_2", true],
				["eg_goal_3", true],
				["eg_goal_4", true],
				["x_goal_1", true],
				["x_goal_2", true],
				["x_goal_3", true]
			),
			"iidx",
			["SP", "DP"],
			1,
			logger
		);

		t.strictSame(
			res,
			[
				{
					questID: "example_quest_id",
					old: {
						progress: 0,
						achieved: false,
					},
					new: {
						progress: 4,
						achieved: true,
					},
				},
				{
					questID: "some_other_quest_with_mutual_goals",
					old: {
						progress: 0,
						achieved: false,
					},
					new: {
						progress: 4,
						achieved: true,
					},
				},
			],
			"Should correctly assert the quests are achieved."
		);
		t.end();
	});

	t.end();
});
