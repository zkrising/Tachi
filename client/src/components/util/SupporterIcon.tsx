import { ToCDNURL } from "util/api";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import { TachiConfig } from "lib/config";
import React, { CSSProperties } from "react";

export default function SupporterIcon() {
	return (
		<QuickTooltip tooltipContent={<span>This user is a {TachiConfig.NAME} supporter!</span>}>
			<img
				className="logo-default"
				style={{ maxHeight: "10px" }}
				alt="Logo"
				src={ToCDNURL("/logos/logo-mark.png")}
			/>
		</QuickTooltip>
	);
}
