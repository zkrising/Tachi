import deepmerge from "deepmerge";
import { Random20Hex } from "utils/misc";
import type { ICollection } from "monk";
import type { ChartDocument, IDStrings } from "tachi-common";

export async function QuickInsert<I extends IDStrings>(
	base: Omit<ChartDocument<I>, "chartID">,
	content: Array<Partial<ChartDocument<I>>>,
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
