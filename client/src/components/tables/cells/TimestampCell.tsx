import React from "react";
import { integer } from "tachi-common";
import { FormatTime, MillisToSince } from "util/time";

export default function TimestampCell({ time }: { time: integer | null }) {
	return (
		<td>
			{time ? (
				<>
					{MillisToSince(time)}

					<br />
					<small className="text-muted">{FormatTime(time)}</small>
				</>
			) : (
				"No Data."
			)}
		</td>
	);
}
