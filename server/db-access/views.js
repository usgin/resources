var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	output = require("../db-views/outputs/outputFormats.js"),
	exports = module.exports;

var repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbRepoName);

function invalidFormatRequested(req, res) {
	formatsAvailable = [];
	for (var k in output.stdFormatsAvailable) { formatsAvailable.push(k); }
	utils.renderToResponse(req, res, "errorResponse", { message: "You requested an invalid format. You can request one of: " + formatsAvailable.join(", "), status: 400 });
}

/** MIDDLEWARE FOR RETREIVING A SINGLE RESOURCE THROUGH A PARTICULAR VIEW **/
exports.viewResource = function(req, res, next) {
	id = req.param("id", null);
	format = req.param("format", null);
	
	if (format in output.stdFormatsAvailable) {
		// HTML view is a special case that doesn't use a db-view
		if (format == "html") { next(); }
		else {
			repository.view("outputs/" + format, { key: id }, function(err, dbRes) {
				if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving view from the database", status: 500 }); }
				else {
					if (dbRes.rows.length == 0) { req.viewResource = null; } 
					else { req.viewResource = dbRes.rows[0].value; }
					next();
				}
			});
		}
	} else {
		invalidFormatRequested(req, res);
	}
};

/** MIDDLEWARE FOR RETREIVING MULTIPLE RESOURCES THROUGH A PARTICULAR VIEW **/
// req.resourceIds must have already been set by prior middleware.
exports.viewMultipleResources = function(req, res, next) {	
	format = req.param("format", null);
	if (format in output.stdFormatsAvailable) {
		// ISO is a special case that does not require any db-views
		if (format == "iso") {
			addContext = { recordUrls: [] };
			for (var i in req.resourceIds) { addContext.recordUrls.push("/resource/" + req.resourceIds[i] + "/iso"); }
			utils.renderToResponse(req, res, "waf", addContext);
		} else {
			repository.view("outputs/" + format, { keys: req.resourceIds }, function(err, viewResponse) {
				if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving views from the database", status: 500 }); }
				else {
					req.viewResources = viewResponse.rows;
					next();
				}
			});
		}
	} else {
		invalidFormatRequested(req, res);
	}
};