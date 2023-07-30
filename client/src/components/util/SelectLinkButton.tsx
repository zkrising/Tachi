import { DoesMatchRoute } from "util/routing";
import React from "react";
import { ButtonVariant } from "react-bootstrap/esm/types";
import LinkButton, { LinkButtonProps } from "./LinkButton";

export default function SelectLinkButton({
	children,
	className,
	onVariant = "primary",
	offVariant = "outline-secondary",
	to,
	matchIfStartsWith = false,
	...props
}: {
	onVariant?: ButtonVariant;
	offVariant?: ButtonVariant;
	to: string;
	matchIfStartsWith?: boolean;
} & LinkButtonProps) {
	const match = DoesMatchRoute(window.location.href, to, !matchIfStartsWith);
	const variant = match ? onVariant : offVariant;
	const classNames = `${match ? "" : "text-body"} ${className}`;

	return (
		<LinkButton
			to={to}
			isActive={() => match}
			variant={variant}
			{...props}
			className={classNames}
		>
			{children}
		</LinkButton>
	);
}
