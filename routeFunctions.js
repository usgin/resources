var exports = module.exports,
	config = require("./config.js");

exports.main = function(req, res) {
	res.render("homepage", config.defaultContext);
};

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