import { useEffect, useState } from "react";

export default function useBreakpoint() {
	const [breakpoint, setBreakpoint] = useState<number>(864);

	const resize = () => setBreakpoint(window.innerWidth);
	useEffect(() => {
		const getCurrentWindow = () => {
			setBreakpoint(window.innerWidth);
		};

		getCurrentWindow();
		window.addEventListener("resize", resize);

		return () => {
			window.removeEventListener("resize", resize);
		};
	}, []);

	return breakpoint;
}
