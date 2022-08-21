export interface BMSTablesDataset {
	url: string;
	name: string;
	description: string;
	playtype: "7K" | "14K";
	prefix: string;
}

export interface BMSTableChart {
	title: string;
	artist: string;
	url: string;
	url_diff: string;
	md5: string;
	sha256: string;
	level: string;
}

export interface CalcReturns {
	md5: string;
	title: string;
	ec: number;
	hc: number;
	ecStr: string;
	hcStr: string;
	baseLevel: string;

	// Internal values for ec/hc metrics; in the case of the v1 calc, these are
	// sigma values.
	ecMetric: number;
	hcMetric: number;
}
