const { IterateCollections } = require("./util");

function RemoveUnderscoreID() {
	IterateCollections((data) => {
		for (const d of data) {
			delete d._id;
		}

		return data;
	});
}

if (require.main === module) {
	RemoveUnderscoreID();
}

module.exports = {
	RemoveUnderscoreID
}
