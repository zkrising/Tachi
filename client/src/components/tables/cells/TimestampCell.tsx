import React from "react";
import { integer } from "tachi-common";
import { FormatTime, MillisToSince } from "util/time";

export default function TimestampCell({
	time,
	service,
}: {
	time: integer | null;
	service?: string | null;
}) {
	return (
		<td style={{ minWidth: "140px", maxWidth: "200px" }}>
			{time ? (
				<>
					{MillisToSince(time)}

					<br />
					<small className="text-muted">{FormatTime(time)}</small>
				</>
			) : (
				"No Data."
			)}
			{service && (
				<>
					<br />
					<small className="text-muted">Played On: {service}</small>
				</>
			)}
		</td>
	);
}
