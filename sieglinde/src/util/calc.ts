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

	private _calculateStep(alpha: number): number {
		let maxDelta = 0;

		const deltaSongDifficulty: Map<SongId, number> = new Map();
		const deltaUserSkill: Map<UserId, number> = new Map();

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

		for (const [songId, delta] of deltaSongDifficulty) {
			const newSongDifficulty = this.songDifficulty.get(songId)! + delta * alpha;

			this.songDifficulty.set(songId, newSongDifficulty);

			if (
				maxDelta === 0 ||
				(maxDelta > 0 && delta > maxDelta) ||
				(maxDelta < 0 && delta < maxDelta)
			) {
				maxDelta = delta;
			}
		}

		for (const [userId, delta] of deltaUserSkill) {
			const newUserSkill = this.userSkill.get(userId)! + delta * alpha;

			this.userSkill.set(userId, newUserSkill);

			if (
				maxDelta === 0 ||
				(maxDelta > 0 && delta > maxDelta) ||
				(maxDelta < 0 && delta < maxDelta)
			) {
				maxDelta = delta;
			}
		}

		return maxDelta;
	}

	computeDifficulty() {
		const limit = 0.005;
		let alpha = 1;
		let maxDelta = 0;
		let lastMaxDelta = 0;

		let t = 0;

		do {
			logger.info(`Executing one step... (alpha = ${alpha})`);
			maxDelta = this._calculateStep(t < 20 ? 0.5 : alpha / 16) / Math.sqrt(alpha);

			logger.info(`Convergence at md = ${maxDelta}`);

			const isLMDPositive = lastMaxDelta > 0;
			const isMDPositive = maxDelta > 0;

			if (isLMDPositive === isMDPositive) {
				alpha = alpha * (alpha > 5 ? 1.005 : 1.02);
			} else {
				alpha = 1;
			}

			if (maxDelta === lastMaxDelta) {
				logger.warn(
					`NOT CONVERGING: Got in a one-cycle loop at ${maxDelta}. Returning anyway?`
				);
				return;
			}

			lastMaxDelta = maxDelta;

			maxDelta = Math.abs(maxDelta);

			if (alpha * maxDelta > 1) {
				alpha = 1 / maxDelta;
			}

			t = t + 1;
		} while (maxDelta > limit);

		logger.info("Difficulties converged!");
	}
}
