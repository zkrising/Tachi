import React, { CSSProperties } from "react";

/**inserts an icon from Font Awesome
 * browse the free icons here: https://origin.fontawesome.com/search?o=r&m=free
 */
export default function Icon({
	type,
	noPad,
	brand,
	onClick,
	colour,
	style,
	regular,
	className = "",
	animation,
	spinReverse,
	show,
}: {
	type: string;
	noPad?: boolean;
	brand?: boolean;
	regular?: boolean;
	onClick?: () => void;
	colour?:
		| "info"
		| "primary"
		| "secondary"
		| "danger"
		| "warning"
		| "success"
		| "white"
		| "black"
		| "muted"
		| "body" // just in case
		| "light"
		| "dark";
	/**Use spinReverse to reverse the "spin" animation*/
	animation?: "beat" | "beat-fade" | "bounce" | "fade" | "flip" | "shake" | "spin" | "spin-pulse";
	/**Use spinReverse in conjunction with the "spin" animation. It's the only animation that has a specific class to change it*/
	spinReverse?: boolean; // i don't know why Font Awesome did it like this, it makes no sense
	/**Pass a state to toggle a "show" class selector*/
	show?: boolean;
	className?: string;
	style?: CSSProperties;
}) {
	const reg = regular ? "r" : brand ? "b" : "s";
	const ani = animation ? ` fa-${animation}` : "";
	const rSpin = spinReverse ? " fa-spin-reverse" : "";
	const pad = noPad ? " p-0" : "";
	const color = colour ? ` text-${colour}` : "";
	const isShow = show ? " show" : "";
	return (
		<i
			onClick={onClick}
			// eslint-disable-next-line prettier/prettier
			className={`fa${reg} fa-${type}${ani}${rSpin}${pad} ${className}${color}${isShow}`}
			style={style}
		/>
	);
}
