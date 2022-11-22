import { ChangeOpacity } from "util/color-opacity";
import { ColourConfig } from "lib/config";
import React from "react";
import ReactSelectAsync from "react-select/async";
import { COLOUR_SET } from "tachi-common";

export default function AsyncSelect<T extends string | null>(
	args: Parameters<typeof ReactSelectAsync>[0]
) {
	return (
		<ReactSelectAsync
			theme={(theme) => ({
				...theme,
				colors: {
					danger: COLOUR_SET.red,
					dangerLight: COLOUR_SET.pink,
					neutral0: "#524e52",
					neutral5: ColourConfig.lightground,
					neutral10: ColourConfig.lightground,
					neutral20: ColourConfig.backestground,
					neutral30: ColourConfig.backestground,
					neutral40: "white",
					neutral50: "white",
					neutral60: "white",
					neutral70: "white",
					neutral80: "white",
					neutral90: "white",
					primary: ColourConfig.primary,
					primary25: ChangeOpacity(ColourConfig.primary, 0.25),
					primary50: ChangeOpacity(ColourConfig.primary, 0.5),
					primary75: ChangeOpacity(ColourConfig.primary, 0.75),
				},
			})}
			cacheOptions
			{...args}
		/>
	);
}
