import { useState, useEffect } from "react";

const useBreakpoint = () => {
	const [isXs, setIsXs] = useState(window.innerWidth >= 0);
	const [isSm, setIsSm] = useState(window.innerWidth >= 648);
	const [isMd, setIsMd] = useState(window.innerWidth >= 864);
	const [isLg, setIsLg] = useState(window.innerWidth >= 1152);
	const [isXl, setIsXl] = useState(window.innerWidth >= 1536);

	useEffect(() => {
		const breakpoints = () => {
			setIsXs(window.innerWidth >= 0);
			setIsSm(window.innerWidth >= 648);
			setIsMd(window.innerWidth >= 864);
			setIsLg(window.innerWidth >= 1152);
			setIsXl(window.innerWidth >= 1536);
		};

		window.addEventListener("resize", breakpoints);

		return () => {
			window.removeEventListener("resize", breakpoints);
		};
	}, []);

	return { isXs, isSm, isMd, isLg, isXl };
};

export default useBreakpoint;
