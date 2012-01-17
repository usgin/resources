var exports = module.exports;

exports.views = {
	title: {
		map: function(collection) {
			result = { title: collection.Title };
			emit(collection._id, result);
		}
	}
};