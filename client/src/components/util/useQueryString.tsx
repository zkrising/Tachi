import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function useQueryString() {
	const { search } = useLocation<{ code?: string }>();

	return useMemo(() => new URLSearchParams(search), [search]);
}
