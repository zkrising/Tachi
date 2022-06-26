import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import React from "react";
import { JustChildren } from "types/react";

const theme = createMuiTheme({
	typography: {
		fontFamily: "Poppins",
	},
});

export function MaterialThemeProvider({ children }: JustChildren) {
	return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
