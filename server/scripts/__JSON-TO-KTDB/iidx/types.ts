export interface MDBJson {
	title: string;
	artist: string;
	marquee: string;
	folder: number;
	genre: string;
	difficulties: Record<DiffNames, number>;
	notecounts: Partial<Record<DiffNames, number>>;
	songID: number;
}

type DiffNames = `${"SP" | "DP"}-${"BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "LEGGENDARIA"}`;
