var exports = module.exports;

exports.views = {
	name: {
		map: function(contact) {
			result = { name: contact.Name || contact.OrganizationName };
			emit(contact._id, result);
		}
	}
};