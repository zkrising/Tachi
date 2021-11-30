import deepmerge from "deepmerge";
import { ICollection } from "monk";
import { ChartDocument, IDStrings } from "tachi-common";
import { Random20Hex } from "utils/misc";

export async function QuickInsert<I extends IDStrings>(
	base: Omit<ChartDocument<I>, "chartID">,
	content: Partial<ChartDocument<I>>[],
	coll: ICollection
) {
	const docs = [];

	for (const c of content) {
		const doc = deepmerge(base, c);

		doc.chartID = Random20Hex();
		docs.push(doc);
	}

	await coll.insert(docs);
}
