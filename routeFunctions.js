var exports = module.exports,
	config = require("./config.js"),
	db = require("./db.js");


// Front Page:
exports.main = function(req, res) {
	res.render("homepage", config.defaultContext);
};


// Editing Page:
exports.editResource = function(req, res) {	
	existingId = req.param("id", null);
	if (existingId) {
		db.getMetadata(existingId, res);
	} else {
		context = config.defaultContext;
		context.existingResource = null;
		res.render("edit", context);
	}
};

// Parse a form
function formParser(fields) {
	theObj = {};
	for (struc in fields) {
		strucBits = struc.split(".");
		if (strucBits[strucBits.length - 1] == "$t") {
			
		} else {
			
		}
	}
}

// Save a Resource
exports.saveResource = function(req, res, next) {
	resourceId = req.param("id", null);
	req.form.complete(function(err, fields, files) {
		if (err) { next(err); }
		else {
			metadata = JSON.parse(fields.theResource);
			db.saveMetadata(resourceId, metadata, files, res);
		}
	});
};