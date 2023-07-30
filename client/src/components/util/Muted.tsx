import React from "react";
import { JustChildren } from "types/react";

export default function Muted({ children }: JustChildren) {
	return <small className="text-body-secondary">{children}</small>;
}
