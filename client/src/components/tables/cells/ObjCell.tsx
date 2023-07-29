import { FlattenValue, StringifyKeyChain } from "util/misc";
import React from "react";

export default function ObjCell({ data }: { data: unknown }) {
	return (
		<td className="text-start">
			{/* this kinda sucks. have we got a better way to do this? */}
			{FlattenValue(data)
				.filter((e) => e.value !== null)
				.filter(
					// hack to hide some annoying itg properties
					(e) => e.keychain[0] !== "npsPerMeasure" && e.keychain[0] !== "notesPerMeasure"
				)
				.map((e) => (
					<>
						<code>{StringifyKeyChain(e.keychain)}</code>: {JSON.stringify(e.value)}
						<br />
					</>
				))}
		</td>
	);
}
