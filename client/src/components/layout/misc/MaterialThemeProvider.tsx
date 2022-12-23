import { ThemeProvider, createTheme } from "@mui/material/styles";

import { ColourConfig } from "lib/config";
import React from "react";
import { JustChildren } from "types/react";

const theme = createTheme({
	typography: {
		fontFamily: "Poppins",
	},
	palette: {
		secondary: {
			main: ColourConfig.primary,
		},
		primary: {
			main: ColourConfig.primary,
		},
	},
	components: {
		MuiButtonBase: {
			defaultProps: {
				disableRipple: true,
			},
		},
	},
});

export function MaterialThemeProvider({ children }: JustChildren) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
