export type Themes = "light" | "dark" | "oled";

export const themeColours: Record<Themes, string> = {
	light: "#FFF",
	dark: "#131313",
	oled: "#000",
};

export function mediaQueryPrefers() {
	if (window.matchMedia("(prefers-color-scheme: dark").matches) {
		return "dark";
	} else {
		return "light";
	}
}

export function getThemePreference() {
	const storedTheme = localStorage.getItem("theme");
	if (storedTheme && storedTheme !== null && storedTheme !== "undefined") {
		return false;
	}
	return true;
}

export function getTheme() {
	const storedTheme = localStorage.getItem("theme");
	if (storedTheme && storedTheme !== null && storedTheme !== "undefined") {
		return storedTheme as Themes;
	}
	return mediaQueryPrefers();
}
