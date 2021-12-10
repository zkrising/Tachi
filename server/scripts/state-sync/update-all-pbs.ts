/* eslint-disable no-await-in-loop */
import { UpdateAllPBs } from "utils/calculations/recalc-scores";

if (require.main === module) {
	UpdateAllPBs();
}
