const { MutateCollection, EfficientInPlaceDeepmerge } = require("./util");
const deepmerge = require("deepmerge");

function DoesMatchCriteria(element, mutation) {
	for (const [key, value] of Object.entries(mutation.match)) {
		if (element[key] !== value) {
			return false;
		}
	}

	return true;
}

function ApplyMutations(name, mutations) {
	MutateCollection(name, (collection) => {
		for (const element of collection) {
			for (const mutation of mutations) {
				if (DoesMatchCriteria(element, mutation)) {
					EfficientInPlaceDeepmerge(element, mutation.data);
				}
			}
		}

		return collection;
	});
}

module.exports = {
	ApplyMutations
}