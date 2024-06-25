import { NumericSOV } from "util/sorts";
import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { FolderDataset, PBDataset, ScoreDataset } from "types/tables";
import { Header } from "../components/TachiTable";

const IndicatorHeader: Header<PBDataset[0] | ScoreDataset[0]> = [
	"Indicators",
	"Id.",
	NumericSOV<ScoreDocument | PBScoreDocument>((x) => Number(x.highlight)),
	() => <td style={{ maxWidth: 5, padding: 0 }}></td>,
];

export const FolderIndicatorHeader: Header<FolderDataset[0]> = [
	"Indicators",
	"Id.",
	NumericSOV<FolderDataset[0]>((x) => Number(x.__related.pb?.highlight)),
	() => <td style={{ maxWidth: 5, padding: 0 }}></td>,
];

export const EmptyHeader: Header<unknown> = ["Empty", "Empty", null, () => <td />];

export default IndicatorHeader;
