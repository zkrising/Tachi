import { DoesMatchRoute } from "util/routing";
import React from "react";
import { ButtonVariant } from "react-bootstrap/esm/types";
import { JustChildren } from "types/react";
import LinkButton from "./LinkButton";

export default function SelectLinkButton({
	children,
	onVariant = "primary",
	offVariant = "outline-secondary",
	to,
}: {
	onVariant?: ButtonVariant;
	offVariant?: ButtonVariant;
	to: string;
} & JustChildren) {
	return (
		<LinkButton
			to={to}
			className={`btn-${DoesMatchRoute(window.location.href, to) ? onVariant : offVariant}`}
		>
			{children}
		</LinkButton>
	);
}
