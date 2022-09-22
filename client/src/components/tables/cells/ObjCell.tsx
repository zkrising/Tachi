import { FlattenValue, StringifyKeyChain } from "util/misc";
import React from "react";

export default function ObjCell({ data }: { data: unknown }) {
	return (
		<td className="text-left">
			{/* this kinda sucks. have we got a better way to do this? */}
			{FlattenValue(data).map((e) => (
				<>
					<code>{StringifyKeyChain(e.keychain)}</code>: {String(e.value)}
					<br />
				</>
			))}
		</td>
	);
}
