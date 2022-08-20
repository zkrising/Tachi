import logger from "../logger";

type SongId = string;
type UserId = number;

const HALF_PI = Math.PI / 2;

function pushMap<K, V>(map: Map<K, Array<V>>, key: K, value: V) {
	const arr = map.get(key);

	if (arr) {
		arr.push(value);
	} else {
		map.set(key, [value]);
	}
}

function sigmoid(x: number): number {
	return Math.atan(x * HALF_PI) / HALF_PI;
}

function dSigmoid(x: number): number {
	const y = Math.PI * x;

	return 4 / (4 + y * y);
}

export class DifficultyComputer {
	normalizedScores: Array<[SongId, UserId, number]> = [];

	songUserMap: Map<SongId, Array<UserId>> = new Map();
	userSongMap: Map<UserId, Array<SongId>> = new Map();

	songDifficulty: Map<SongId, number> = new Map();
	userSkill: Map<UserId, number> = new Map();

	constructor(data: Array<[SongId, UserId, number]>) {
		logger.info(`Reading ${data.length} data...`);

		// For binary feature
		const hasClear: Set<UserId> = new Set();
		const hasUnclear: Set<UserId> = new Set();

		for (const [_songId, userId, score] of data) {
			if (score === 1) {
				hasClear.add(userId);
			}

			if (score === -1) {
				hasUnclear.add(userId);
			}
		}

		const deletedUsers: Set<UserId> = new Set();

		for (const [songId, userId, score] of data) {
			if (hasClear.has(userId) !== hasUnclear.has(userId)) {
				deletedUsers.add(userId);
				continue;
			}

			pushMap(this.songUserMap, songId, userId);
			pushMap(this.userSongMap, userId, songId);

			this.songDifficulty.set(songId, 0);
			this.userSkill.set(userId, 0);

			this.normalizedScores.push([songId, userId, score]);
		}

		logger.warn(`${deletedUsers.size} users ignored.`);

		logger.info(`Read ${this.songDifficulty.size} songs and ${this.userSkill.size} users.`);
	}

	private readonly _deltaSongDifficulty: Map<SongId, number> = new Map();
	private readonly _deltaUserSkill: Map<UserId, number> = new Map();

	private _calculateStep(alpha: number): number {
		let maxDelta = 0;

		const deltaSongDifficulty = this._deltaSongDifficulty;
		const deltaUserSkill = this._deltaUserSkill;

		for (const songId of this.songDifficulty.keys()) {
			deltaSongDifficulty.set(songId, 0);
		}

		for (const userId of this.userSkill.keys()) {
			deltaUserSkill.set(userId, 0);
		}

		for (const [songId, userId, score] of this.normalizedScores) {
			const currSongDifficulty = this.songDifficulty.get(songId)!;
			const currUserSkill = this.userSkill.get(userId)!;

			const potent = currUserSkill - currSongDifficulty;
			const diff = (sigmoid(potent) - score) * dSigmoid(potent);

			deltaSongDifficulty.set(
				songId,
				deltaSongDifficulty.get(songId)! + diff / this.songUserMap.get(songId)!.length
			);

			deltaUserSkill.set(
				userId,
				deltaUserSkill.get(userId)! - diff / this.userSongMap.get(userId)!.length
			);
		}

		let minSongDifficulty = 0;
		let maxSongDifficulty = 0;

		for (const [songId, delta] of deltaSongDifficulty) {
			const newSongDifficulty = this.songDifficulty.get(songId)! + delta * alpha;

			this.songDifficulty.set(songId, newSongDifficulty);

			if (newSongDifficulty < minSongDifficulty) {
				minSongDifficulty = newSongDifficulty;
			}

			if (newSongDifficulty > maxSongDifficulty) {
				maxSongDifficulty = newSongDifficulty;
			}

			if (
				maxDelta === 0 ||
				(maxDelta > 0 && delta > maxDelta) ||
				(maxDelta < 0 && delta < maxDelta)
			) {
				maxDelta = delta;
			}
		}

		logger.debug(
			`Song difficulty range (${this.songDifficulty.size} songs): ${minSongDifficulty.toFixed(
				4
			)} - ${maxSongDifficulty.toFixed(4)}`
		);

		let minUserSkill = 0;
		let maxUserSkill = 0;

		for (const [userId, delta] of deltaUserSkill) {
			const newUserSkill = this.userSkill.get(userId)! + delta * alpha;

			this.userSkill.set(userId, newUserSkill);

			if (newUserSkill < minUserSkill) {
				minUserSkill = newUserSkill;
			}

			if (newUserSkill > maxUserSkill) {
				maxUserSkill = newUserSkill;
			}

			if (
				maxDelta === 0 ||
				(maxDelta > 0 && delta > maxDelta) ||
				(maxDelta < 0 && delta < maxDelta)
			) {
				maxDelta = delta;
			}
		}

		logger.debug(
			`User skill range (${this.userSkill.size} users): ${minUserSkill.toFixed(
				4
			)} - ${maxUserSkill.toFixed(4)}`
		);

		return maxDelta;
	}

	computeDifficulty() {
		const limit = 0.001;
		let alpha = 1;
		let md = 0;
		let mdl = 0;

		let t = 0;

		do {
			logger.info(`Executing one step... (alpha = ${alpha})`);
			md = this._calculateStep(t < 20 ? 0.5 : alpha / 16) / Math.sqrt(alpha);

			logger.debug(`md = ${md}`);

			const isMdlPositive = mdl > 0;
			const isMdPositive = md > 0;

			if (isMdlPositive === isMdPositive) {
				alpha = alpha * (alpha > 5 ? 1.005 : 1.02);
			} else {
				alpha = 1;
			}

			mdl = md;
			if (md < 0) {
				md = -md;
			}

			if (alpha * md > 1) {
				alpha = 1 / md;
			}

			t = t + 1;
		} while (md > limit);

		logger.info("Difficulties converged!");
	}
}
