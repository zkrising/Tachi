import React from "react";
// import { BPI_COLOURS } from "util/constants/colours";

// tried it - doesn't look good. - zkldi
// import colorInterpolate from "color-interpolate";

// const scale = colorInterpolate([
// 	BPI_COLOURS.ZERO,
// 	BPI_COLOURS.TEN,
// 	BPI_COLOURS.TWENTY,
// 	BPI_COLOURS.THIRTY,
// 	BPI_COLOURS.FOURTY,
// 	BPI_COLOURS.FIFTY,
// 	BPI_COLOURS.SIXTY,
// 	BPI_COLOURS.SEVENTY,
// 	BPI_COLOURS.EIGHTY,
// 	BPI_COLOURS.NINETY,
// 	BPI_COLOURS.MAX,
// ]);

// function GetColor(bpi: number) {
// 	if (bpi < 0) {
// 		return BPI_COLOURS.NEGATIVE;
// 	} else if (bpi < 10) {
// 		return BPI_COLOURS.ZERO;
// 	} else if (bpi < 20) {
// 		return BPI_COLOURS.TEN;
// 	} else if (bpi < 30) {
// 		return BPI_COLOURS.TWENTY;
// 	} else if (bpi < 40) {
// 		return BPI_COLOURS.THIRTY;
// 	} else if (bpi < 50) {
// 		return BPI_COLOURS.FOURTY;
// 	} else if (bpi < 60) {
// 		return BPI_COLOURS.FIFTY;
// 	} else if (bpi < 70) {
// 		return BPI_COLOURS.SIXTY;
// 	} else if (bpi < 80) {
// 		return BPI_COLOURS.SEVENTY;
// 	} else if (bpi < 90) {
// 		return BPI_COLOURS.EIGHTY;
// 	} else if (bpi < 100) {
// 		return BPI_COLOURS.NINETY;
// 	} else {
// 		return BPI_COLOURS.MAX;
// 	}
// }

export default function BPICell({ bpi }: { bpi?: number | null }) {
	if (!bpi) {
		return <td>No Data.</td>;
	}

	return (
		<td
			style={
				{
					// backgroundColor: ChangeOpacity(GetColor(bpi), 0.4),
				}
			}
		>
			{bpi}
		</td>
	);
}
