import { JSONAttributeDiff, StringifyKeyChain } from "util/misc";
import React from "react";

export default function SeedsDiffCell({ diffs }: { diffs: JSONAttributeDiff[] }) {
	return (
		<td>
			<div
				style={{
					maxHeight: "200px",
					maxWidth: "600px",
					overflow: "auto",
					textAlign: "left",
				}}
			>
				{diffs.map((e) => (
					<div key={StringifyKeyChain(e.keychain)}>
						<code>{StringifyKeyChain(e.keychain)}</code>
						<br />
						<DiffRow diff={e} />
					</div>
				))}
			</div>
		</td>
	);
}

function DiffRow({ diff }: { diff: JSONAttributeDiff }) {
	// added
	if (diff.beforeVal === undefined) {
		return <span className="text-success">+{JSON.stringify(diff.afterVal)}</span>;
	}

	// deleted
	if (diff.afterVal === undefined) {
		return <span className="text-danger">-{JSON.stringify(diff.beforeVal)}</span>;
	}

	// modified

	return (
		<span>
			<div>
				<span className="text-danger">-{JSON.stringify(diff.beforeVal)}</span>
				<br />
				<span className="text-success">+{JSON.stringify(diff.afterVal)}</span>
			</div>
		</span>
	);
}
