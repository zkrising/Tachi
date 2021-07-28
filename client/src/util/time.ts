import { DateTime, Duration } from "luxon";
import humaniseDuration from "humanize-duration";

export function MillisToSince(ms: number) {
	return DateTime.fromMillis(ms).toRelative();
}

export function FormatTime(ms: number) {
	return DateTime.fromMillis(ms).toLocaleString(DateTime.DATETIME_MED);
}

export function FormatDate(ms: number) {
	return DateTime.fromMillis(ms).toLocaleString(DateTime.DATE_HUGE);
}

export function FormatDuration(ms: number) {
	return humaniseDuration(ms);
}

export function FormatTimeSmall(ms: number) {
	return DateTime.fromMillis(ms).toLocaleString(DateTime.DATE_SHORT);
}
