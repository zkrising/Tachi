import React from "react";

export default function DebugContent({ data }: { data: unknown }) {
	return (
		<textarea
			readOnly
			className="w-100 text-monospace"
			style={{ height: "400px" }}
			value={JSON.stringify(data, null, 4)}
		/>
	);
}
