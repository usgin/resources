var exports = module.exports,
	config = require("./config.js");


// Front Page:
exports.main = function(req, res) {
	res.render("homepage", config.defaultContext);
};


// Editing Page:
exports.editResource = function(req, res) {
	// Build context with which to render edit.jade
	context = config.defaultContext;
	context.contactTemplate = JSON.stringify(config.contactTemplate);
	context.linkTemplate = JSON.stringify(config.linkTemplate);
	context.metadataTemplate = JSON.stringify(config.metadataTemplate);
	
	// If the request is for a particular record, we'll be
	//  editing -- get the record from the database, include
	//  it in the render context
	existingId = req.param("id", null);
	if (existingId) {
		// TODO: Get the database object
		dbObj = { needToo: "Get the Database Object!" };
	} else { dbObj = null; }
	context.existingResource = dbObj;
	
	// Render the edit.jade file
	res.render("edit", context);
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
	req.form.complete(function(err, fields, files) {
		if (err) { next(err); }
		else {
			theResource = JSON.parse(fields.theResource);
			res.json(theResource);
		}
	});
};