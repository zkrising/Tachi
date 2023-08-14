import { breakpoints } from "util/constants/breakpoints";
import { Themes, getTheme, themeColours } from "util/theme";
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

	useEffect(() => {
		const resize = () => setClientWidth(getClientWidth());
		const throttledResize = throttle(resize, 250);
		window.addEventListener("resize", throttledResize);

		return () => {
			window.removeEventListener("resize", throttledResize);
		};
	});

	const [theme, setTheme] = useState<Themes>(getTheme());

	useLayoutEffect(() => {
		document.documentElement.setAttribute("data-bs-theme", theme as Themes);
		const metaTheme = document.querySelector("meta[name='theme-color']");
		metaTheme!.setAttribute("content", themeColours[theme as Themes]);
	}, [theme]);

	return (
		<WindowContext.Provider value={{ clientWidth, breakpoint, theme, setTheme }}>
			{children}
		</WindowContext.Provider>
	);
}
