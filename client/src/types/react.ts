import { Dispatch, SetStateAction } from "react";

export interface JustChildren {
	children: JSX.Element[] | JSX.Element | string;
}

export type SetState<T> = Dispatch<SetStateAction<T>>;
