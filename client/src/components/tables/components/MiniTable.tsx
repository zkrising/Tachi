import { nanoid } from "nanoid";
import React from "react";
import { integer } from "tachi-common";
import { JustChildren } from "types/react";

export default function MiniTable({
	className,
	children,
	headers,
	colSpan = 1,
}: { className?: string; headers?: string[]; colSpan?: integer | integer[] } & JustChildren) {
	return (
		<table
			className={`table table-hover table-striped table-vertical-center text-center ${className}`}
		>
			{headers && (
				<thead>
					<tr>
						{headers.map((e, i) => (
							<th colSpan={Array.isArray(colSpan) ? colSpan[i] : colSpan} key={i}>
								{e}
							</th>
						))}
					</tr>
				</thead>
			)}
			<tbody>{children}</tbody>
		</table>
	);
}
