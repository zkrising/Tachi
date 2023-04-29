import { ToCDNURL } from "util/api";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import { TachiConfig } from "lib/config";
import React from "react";

export default function SupporterIcon() {
	return (
		<QuickTooltip tooltipContent={<span>This user is a {TachiConfig.name} supporter!</span>}>
			<img
				className="mx-0h"
				style={{ maxHeight: "10px" }}
				alt="Logo"
				src={ToCDNURL("/logos/logo-mark.png")}
			/>
		</QuickTooltip>
	);
}
