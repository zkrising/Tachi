import { nanoid } from "nanoid";
import React from "react";
import { integer } from "tachi-common";
import { JustChildren } from "types/react";

export default function MiniTable({
	className,
	children,
	headers,
	colSpan = 1,
}: { className?: string; headers: string[]; colSpan?: integer } & JustChildren) {
	return (
		<table
			className={`table table-hover table-striped table-vertical-center text-center ${className}`}
		>
			<thead>
				<tr>
					{headers.map(e => (
						<th colSpan={colSpan} key={nanoid()}>
							{e}
						</th>
					))}
				</tr>
			</thead>
			<tbody>{children}</tbody>
		</table>
	);
}
