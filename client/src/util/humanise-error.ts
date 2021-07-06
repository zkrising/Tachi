/**
 * Strips off all the nasty developer-prudence stuff.
 */
export function HumaniseError(err: string) {
	return err.split(/(\. \(Recieved|\[K:)/u)[0];
}
