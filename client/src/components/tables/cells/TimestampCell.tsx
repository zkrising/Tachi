import React from "react";
import { integer } from "tachi-common";
import { DateTime } from "luxon";

export default function TimestampCell({ time }: { time: integer | null }) {
	return (
		<td>
			{time ? (
				<>
					{DateTime.fromMillis(time).toLocaleString(DateTime.DATETIME_MED)}
					<br />
					<small className="text-muted">{DateTime.fromMillis(time).toRelative()}</small>
				</>
			) : (
				"No Data."
			)}
		</td>
	);
}
