import React from "react";
import { JustChildren } from "types/react";

export default function Muted({ children }: JustChildren) {
	return <small className="text-muted">{children}</small>;
}
