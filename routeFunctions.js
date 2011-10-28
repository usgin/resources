var exports = module.exports,
	config = require("./config.js"),
	db = require("./db.js"),
	output = require("./db-views/outputs/outputFormats.js");


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

// Get a formatted Resource
exports.getFormattedResource = function(req, res) {
	resourceId = req.param("id", null);
	requestedFormat = req.param("format", null);
	if (requestedFormat in output.stdFormatsAvailable) {
		db.returnFormattedRecord(resourceId, requestedFormat, res);
	} else {
		context = config.defaultContext;
		formatsAvailable = [];
		for (var k in output.stdFormatsAvailable) { formatsAvailable.push(k); }
		context.message = "You requested an invalid format. You can request one of: " + formatsAvailable;
		context.status = 404;
		res.render("errorResponse", context);
	}
};