import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { ColourConfig } from "lib/config";
import React from "react";
import { JustChildren } from "types/react";

const theme = createMuiTheme({
	typography: {
		fontFamily: "Poppins",
	},
	palette: {
		// for reasons unfathomable to mere mortals
		// material UI uses "secondary" as the primary colour
		// for things like tab indicators.
		secondary: {
			main: ColourConfig.primary,
		},
	},
});

export function MaterialThemeProvider({ children }: JustChildren) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
