import { breakpoints } from "util/constants/breakpoints";
import React, {
	createContext,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { throttle } from "lodash";
import { JustChildren, SetState } from "types/react";

export type Themes = keyof typeof themeColours;

export const themeColours = {
	light: "#FFF",
	dark: "#131313",
	oled: "#000",
};

function getTheme() {
	const storedTheme = localStorage.getItem("theme");
	if (storedTheme && storedTheme !== null && storedTheme !== "undefined") {
		return storedTheme as Themes;
	}
	if (window.matchMedia("(prefers-color-scheme: dark").matches) {
		return "dark";
	} else {
	return "light";
	}
};

export type WindowContextProps = {
	clientWidth: number;
	breakpoint: {
		isSm: boolean;
		isMd: boolean;
		isLg: boolean;
		isXl: boolean;
	};
	theme: Themes;
	setTheme: SetState<Themes>;
};

export const WindowContext = createContext<WindowContextProps>({
	clientWidth: 0,
	breakpoint: {
		isSm: false,
		isMd: false,
		isLg: false,
		isXl: false,
	},
	theme: "dark",
	setTheme: () => null,
});

export function WindowContextProvider({ children }: JustChildren) {
	const [theme, setTheme] = useState<Themes>(getTheme());

	const getClientWidth = useCallback(() => window.innerWidth || 0, []);
	const [clientWidth, setClientWidth] = useState<number>(getClientWidth());
	const breakpoint = useMemo(
		() => ({
			isSm: clientWidth >= breakpoints.sm,
			isMd: clientWidth >= breakpoints.md,
			isLg: clientWidth >= breakpoints.lg,
			isXl: clientWidth >= breakpoints.xl,
		}),
		[clientWidth]
	);

	useLayoutEffect(() => {
		document.documentElement.setAttribute("data-bs-theme", theme as Themes);
		const metaTheme = document.querySelector("meta[name='theme-color']");
		metaTheme!.setAttribute("content", themeColours[theme as Themes]);
	}, [theme]);

	useEffect(() => {
		const resize = () => setClientWidth(getClientWidth());
		const throttledResize = throttle(resize, 250);
		window.addEventListener("resize", throttledResize);

		return () => {
			window.removeEventListener("resize", throttledResize);
		};
	});

	return (
		<WindowContext.Provider value={{ clientWidth, breakpoint, theme, setTheme }}>
			{children}
		</WindowContext.Provider>
	);
}
