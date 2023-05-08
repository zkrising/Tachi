import React, { useEffect } from "react";
import { integer } from "tachi-common";

export function SDVXMaxEXScoreCell({
	ex,
	maxEx,
	setSPuc,
}: {
	ex: number;
	maxEx: number;
	setSPuc: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
	const percent = ex !== 0 ? maxEx / ex : 0;
	const diff = maxEx - ex;

	useEffect(() => {
		if (diff === 0) {
			setSPuc(true);
		}
	}, [diff, setSPuc]);

	return (
		<>
			{maxEx !== 0 && ex !== 0 ? (
				percent <= 0.96 ? (
					<>
						<br />
						{(percent * 100).toFixed(2)}%
					</>
				) : (
					<>
						<br />
						MAX -{diff}
					</>
				)
			) : null}
		</>
	);
}

export function SDVXEXScoreCell(ex: integer) {
	if (ex !== 0) {
		return (
			<>
				<br /> {ex} EX
			</>
		);
	}
	return null;
}
