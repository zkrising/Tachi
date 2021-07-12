import React from "react";

export default function Divider({ className }: { className?: string }) {
	return <div className={`separator separator-solid opacity-7 ${className ?? ""}`}></div>;
}
