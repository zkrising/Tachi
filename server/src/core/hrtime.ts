/**
 * Takes a process.hrtime.bigint(), and returns the miliseconds elapsed since it.
 * This function will not work if more than 100(ish) days have passed since the first reference.
 */
export function GetMilisecondsSince(ref: bigint) {
    return Number(process.hrtime.bigint() - ref) / 1e6;
}
