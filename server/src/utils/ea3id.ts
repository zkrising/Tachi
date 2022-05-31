export function ParseEA3SoftID(ver: string) {
	const a = ver.split(":");

	if (a.length !== 5) {
		throw new Error(`Invalid Version Code. Had ${a.length} components.`);
	}

	if (!/^[A-Z0-9]{3}:[A-Z]:[A-Z]:[A-Z]:[0-9]{10}$/u.exec(ver)) {
		throw new Error(`Invalid Version Code.`);
	}

	return {
		model: a[0],

		// region
		dest: a[1],

		spec: a[2],
		rev: a[3],
		ext: a[4],
	};
}
