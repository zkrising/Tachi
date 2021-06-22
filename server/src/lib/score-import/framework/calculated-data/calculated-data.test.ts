import p from "prudence";
import t from "tap";
import db from "../../../../external/mongo/db";
import CreateLogCtx from "../../../logger/logger";
import { prAssert } from "../../../../test-utils/asserts";
import {
	Testing511SPA,
	TestingDoraChart,
	TestingGITADORADoraDryScore,
	TestingIIDXSPDryScore,
	TestingSDVXSingleDryScore,
} from "../../../../test-utils/test-data";
import { CreateCalculatedData, CalculateDataForGamePT } from "./calculated-data";
import deepmerge from "deepmerge";
import ResetDBState from "../../../../test-utils/resets";
import { CloseAllConnections } from "../../../../test-utils/close-connections";

const logger = CreateLogCtx(__filename);

t.test("#CreateCalculatedData", async (t) => {
	const res = await CreateCalculatedData(TestingIIDXSPDryScore, Testing511SPA, 30, logger);

	prAssert(
		res,
		{
			ktRating: p.aprx(2.65),
			ktLampRating: p.equalTo(10),
			BPI: "?number",
		},
		"Should correctly produce calculatedData"
	);

	const gitadoraRes = await CreateCalculatedData(
		TestingGITADORADoraDryScore,
		TestingDoraChart,
		30,
		logger
	);

	prAssert(
		gitadoraRes,
		{
			skill: p.isPositiveNonZero,
		},
		"Should correctly call rating function overrides for different games"
	);

	t.end();
});

/**
 * These tests only check that the right properties are assigned.
 */
t.test("#CalculateDataForGamePT", (t) => {
	const defaultTierlistID = undefined;
	t.test("IIDX:SP", async (t) => {
		const res = await CalculateDataForGamePT(
			"iidx",
			"SP",
			Testing511SPA,
			TestingIIDXSPDryScore,
			30,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				ktRating: "?number",
				ktLampRating: "?number",
				BPI: "?number",
			},
			"Response should contain keys for IIDX:SP"
		);

		t.end();
	});

	t.test("IIDX:DP", async (t) => {
		const res = await CalculateDataForGamePT(
			"iidx",
			"DP",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an SP score. but we're testing
			30,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				ktRating: "?number",
				ktLampRating: "?number",
				BPI: "?number",
			},
			"Response should contain keys for IIDX:DP"
		);

		t.end();
	});

	t.test("SDVX:Single", async (t) => {
		const res = await CalculateDataForGamePT(
			"sdvx",
			"Single",
			Testing511SPA,
			TestingSDVXSingleDryScore,
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				VF6: p.nullable(p.isPositive),
			},
			"Response should contain keys for SDVX:Single"
		);

		t.end();
	});

	t.test("DDR:SP", async (t) => {
		const res = await CalculateDataForGamePT(
			"ddr",
			"SP",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				MFCP: p.nullable(p.isPositiveInteger),
				ktRating: "?number",
			},
			"Response should contain keys for DDR:SP"
		);

		t.end();
	});

	t.test("DDR:DP", async (t) => {
		const res = await CalculateDataForGamePT(
			"ddr",
			"DP",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				MFCP: "null",
				ktRating: "?number",
			},
			"Response should contain nulled keys for DDR:DP"
		);

		t.end();
	});

	t.test("chunithm:Single", async (t) => {
		const res = await CalculateDataForGamePT(
			"chunithm",
			"Single",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				rating: "?number",
			},
			"Response should contain nulled keys for chunithm:Single"
		);

		t.end();
	});

	t.test("maimai:Single", async (t) => {
		const res = await CalculateDataForGamePT(
			"maimai",
			"Single",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				ktRating: "?number",
			},
			"Response should contain nulled keys for maimai:Single"
		);

		t.end();
	});

	t.test("museca:Single", async (t) => {
		const res = await CalculateDataForGamePT(
			"museca",
			"Single",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				ktRating: "?number",
			},
			"Response should contain nulled keys for museca:Single"
		);

		t.end();
	});

	t.test("bms:7K", async (t) => {
		const res = await CalculateDataForGamePT(
			"bms",
			"7K",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				sieglinde: "?number",
			},
			"Response should contain nulled keys for bms:7K"
		);

		t.end();
	});

	t.test("bms:14K", async (t) => {
		const res = await CalculateDataForGamePT(
			"bms",
			"14K",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				sieglinde: "?number",
			},
			"Response should contain nulled keys for bms:14K"
		);

		t.end();
	});

	t.test("gitadora:Gita", async (t) => {
		const res = await CalculateDataForGamePT(
			"gitadora",
			"Gita",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				skill: "?number",
			},
			"Response should contain nulled keys for gitadora:Gita"
		);

		t.end();
	});

	t.test("gitadora:Dora", async (t) => {
		const res = await CalculateDataForGamePT(
			"gitadora",
			"Dora",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				skill: "?number",
			},
			"Response should contain nulled keys for gitadora:Dora"
		);

		t.end();
	});

	t.test("usc:Single", async (t) => {
		const res = await CalculateDataForGamePT(
			"usc",
			"Single",
			Testing511SPA,
			TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
			null,
			defaultTierlistID,
			logger
		);

		prAssert(
			res,
			{
				VF6: "?number",
			},
			"Response should contain nulled keys for usc:Single"
		);

		t.end();
	});

	// t.test("jubeat:Single", async (t) => {
	// 	const res = await CalculateDataForGamePT(
	// 		"jubeat",
	// 		"Single",
	// 		Testing511SPA,
	// 		TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
	// 		null,
	// 		defaultTierlistID,
	// 		logger
	// 	);

	// 	prAssert(
	// 		res,
	// 		{
	// 			jubility: "?number",
	// 		},
	// 		"Response should contain nulled keys for jubeat:Single"
	// 	);

	// 	t.end();
	// });

	// t.test("popn:9B", async (t) => {
	// 	const res = await CalculateDataForGamePT(
	// 		"popn",
	// 		"9B",
	// 		Testing511SPA,
	// 		TestingIIDXSPDryScore, // fake! this is an iidx score. but we're testing
	// 		null,
	// 		defaultTierlistID,
	// 		logger
	// 	);

	// 	prAssert(res, {}, "Response should contain nulled keys for popn:9B");

	// 	t.end();
	// });

	t.end();
});

t.teardown(CloseAllConnections);
