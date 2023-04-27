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
	className,
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
	/**use spinReverse to reverse the "spin" animation*/
	animation?: "beat" | "beat-fade" | "bounce" | "fade" | "flip" | "shake" | "spin" | "spin-pulse";
	/**Use spinReverse in conjunction with the "spin" animation. It's the only animation that has a specific class to change it*/
	spinReverse?: boolean; // i don't know why Font Awesome did it like this, it makes no sense
	/**allows for css animation if we can augment the component with onClick*/
	show?: boolean;
	className?: string;
	style?: CSSProperties;
}) {
	return (
		<i
			onClick={onClick}
			// eslint-disable-next-line prettier/prettier
			className={`fa${regular ? "r" : brand ? "b" : "s"} fa-${type}${animation ? ` fa-${animation}` : ""}${spinReverse ? " fa-spin-reverse" : ""}${noPad ? " p-0" : ""}${className ? ` ${className}` : ""}${colour ? ` text-${colour}` : ""}${show ? " show" : ""}`}
			style={style}
		/>
	);
}
