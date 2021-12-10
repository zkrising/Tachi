import { KtLogger } from "lib/logger/logger";
import p from "prudence";
import { integer } from "tachi-common";
import { FormatPrError } from "utils/prudence";
import ScoreImportFatalError from "../../../framework/score-importing/score-import-error";
import { ParserFunctionReturns } from "../../common/types";
import { BeatorajaChart, BeatorajaContext, BeatorajaScore } from "./types";

const PR_BeatorajaScore = {
	sha256: "string",
	exscore: p.isPositiveInteger,
	passnotes: p.isPositiveInteger,
	gauge: p.or(p.isBetween(0, 100), p.is(-1)),
	deviceType: p.isIn("BM_CONTROLLER", "KEYBOARD"),
	minbp: p.or(p.isPositiveInteger, p.is(-1)),
	option: p.isBoundedInteger(0, 4),

	lntype: p.isIn(0, 1),
	clear: p.isIn(
		"NoPlay",
		"Failed",
		"LightAssistEasy",
		"Easy",
		"Normal",
		"Hard",
		"ExHard",
		"FullCombo",
		"Perfect"
	),
	assist: p.is(0),
	maxcombo: p.isPositiveInteger,

	epg: p.isPositiveInteger,
	egr: p.isPositiveInteger,
	egd: p.isPositiveInteger,
	ebd: p.isPositiveInteger,
	epr: p.isPositiveInteger,
	lpg: p.isPositiveInteger,
	lgr: p.isPositiveInteger,
	lgd: p.isPositiveInteger,
	lbd: p.isPositiveInteger,
	lpr: p.isPositiveInteger,
	ems: p.isPositiveInteger,
	lms: p.isPositiveInteger,
};

const PR_BeatorajaChart = {
	md5: "string",
	sha256: "string",
	title: "string",
	subtitle: "string",
	genre: "string",
	artist: "string",
	subartist: "string",
	total: p.isPositive,
	lntype: p.isIn(-1, 0, 1, 2),

	// currently only accepted playtypes.
	mode: p.isIn("BEAT_7K", "BEAT_14K"),
	judge: p.isPositive,
	notes: p.isPositiveInteger,
	hasUndefinedLN: "boolean",
	hasRandom: "boolean",
};

const SUPPORTED_BEATORAJA_CLIENTS = [
	"LR2oraja 0.8.3",
	"LR2oraja 0.8.2",
	"LR2oraja 0.8.1",
	"LR2oraja 0.8.0",
	"LR2oraja(rekidai.info) 0.8.3",
	"LR2oraja(rekidai.info) 0.8.2",
	"LR2oraja(rekidai.info) 0.8.1",
	"LR2oraja(rekidai.info) 0.8.0",
];

export function ParseBeatorajaSingle(
	body: Record<string, unknown>,
	userID: integer,
	logger: KtLogger
): ParserFunctionReturns<BeatorajaScore, BeatorajaContext> {
	const err = p(
		body.score,
		PR_BeatorajaScore,
		{},
		{ allowExcessKeys: true, throwOnNonObject: false }
	);

	if (err) {
		throw new ScoreImportFatalError(
			400,
			FormatPrError(err, "Invalid Beatoraja Import - Score")
		);
	}

	const chartErr = p(
		body.chart,
		PR_BeatorajaChart,
		{},
		{ allowExcessKeys: true, throwOnNonObject: false }
	);

	if (chartErr) {
		throw new ScoreImportFatalError(
			400,
			FormatPrError(chartErr, "Invalid Beatoraja Import - Chart")
		);
	}

	// Force stringify this, since it's not validated by prudence.
	const client = `${body.client}`;

	if (!SUPPORTED_BEATORAJA_CLIENTS.includes(client)) {
		throw new ScoreImportFatalError(400, `Unsupported client ${client}`);
	}

	return {
		context: {
			client: "lr2oraja",
			// asserted using prudence.
			chart: body.chart as BeatorajaChart,
			userID,
			timeReceived: Date.now(),
		},
		game: "bms",
		iterable: [body.score] as unknown as BeatorajaScore[],
		classHandler: null,
	};
}
