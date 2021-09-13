import React from "react";
import { Button } from "react-bootstrap";
import { ButtonVariant } from "react-bootstrap/esm/types";
import { JustChildren, SetState } from "types/react";
import { DoesMatchRoute } from "util/routing";
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
