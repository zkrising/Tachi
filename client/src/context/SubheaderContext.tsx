import { NO_OP } from "util/misc";
import React, { createContext, useState } from "react";
import { JustChildren, SetState } from "types/react";

export const SubheaderContext = createContext({
	title: "",
	setTitle: NO_OP as SetState<string>,
	breadcrumbs: [] as string[],
	setBreadcrumbs: NO_OP as SetState<string[]>,
});

export const SubheaderConsumer = SubheaderContext.Consumer;

export function SubheaderContextProvider({ children }: JustChildren) {
	const [title, setTitle] = useState("");
	const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
	return (
		<SubheaderContext.Provider value={{ title, setTitle, breadcrumbs, setBreadcrumbs }}>
			{children}
		</SubheaderContext.Provider>
	);
}
