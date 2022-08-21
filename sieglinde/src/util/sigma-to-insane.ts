/**
 * The average value of each baseLevel. the first value should correspond to 1.5 on
 * the insane scale.
 *
 * We achieve this via linear interpolation between all these points. Since we have enough
 * points to do this reasonably, it works fine.
 */
const EC_CONSTANTS = [
	-4.489678583, // 1
	-3.514297762, // 2
	-2.992166987, // 3
	-2.603405337,
	-2.127131864,
	-1.710360701,
	-1.343979131,
	-1.107798763,
	-0.8070774572,
	-0.5626570675,
	-0.2711068634,
	0.2249717439,
	0.426367502,
	0.8257365093,
	1.039924494,
	1.29938196,
	1.615489641,
	1.93562607,
	2.433064014,
	2.674494597,
	3.036266494,
	3.749242559,
	4.395436558,
	4.9125179,
	6.070885183, // 25
];

export function toInsane(value: number) {
	for (let i = 0; i < EC_CONSTANTS.length; i++) {
		if (value < EC_CONSTANTS[i]!) {
			if (i === 0) {
				const n0 = EC_CONSTANTS[i]!;
				const n1 = EC_CONSTANTS[i + 1]!;

				const v0 = i + 1.5;
				const v1 = i + 2.5;

				const t = Math.abs((value - n0) / (n1 - n0));

				return v0 - t * (v1 - v0);
			}

			const n0 = EC_CONSTANTS[i - 1]!;
			const n1 = EC_CONSTANTS[i]!;

			const v1 = i + 1.5;
			const v0 = v1 - 1;

			const t = Math.abs((value - n0) / (n1 - n0));

			return v0 + t * (v1 - v0);
		}
	}

	const n0 = EC_CONSTANTS[23]!;
	const n1 = EC_CONSTANTS[24]!;

	const v0 = 24.5;
	const v1 = 25.5;

	const t = Math.abs((value - n0) / (n1 - n0));

	return v1 + t * (v1 - v0);
}
