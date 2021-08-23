import { useState, useEffect } from "react";
import { PBDataset, ScoreDataset } from "types/tables";

export function useScoreState(sc: ScoreDataset[0]) {
	const [highlight, setHighlight] = useState(sc.highlight);
	const [comment, setComment] = useState(sc.comment);

	useEffect(() => {
		sc.comment = comment;
		sc.highlight = highlight;
	}, [comment, highlight]);

	return { highlight, comment, setHighlight, setComment };
}

export function usePBState(pb: PBDataset[0]) {
	const [highlight, setHighlight] = useState(pb.highlight);

	useEffect(() => {
		pb.highlight = highlight;
	}, [highlight]);

	return { highlight, setHighlight };
}
