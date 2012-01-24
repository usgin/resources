var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	exports = module.exports;

var repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbRepoName);

/** MIDDLEWARE FOR RETREIVING A SINGLE RESOURCE **/
exports.getResource = function(req, res, next) {
	id = req.param("id", false);
	if (!id) { req.resource = null; next(); }
	else {
		repository.get(id, function(err, doc) {
			if (err) { utils.renderToResponse(req, res, "errorResponse", { searchedId: id, status: 404 }); } 
			else {
				req.resource = doc;
				next();
			}
		});
	}
};

/** MIDDLEWARE FOR RETREIVING MULTIPLE RESOURCES **/
// req.resourceIds must have already been set by prior middleware.
exports.getMultipleResources = function(req, res, next) {	
	repository.get(req.resourceIds, function(err, records) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving resources", status: 500}); }
		else {
			req.resources = records;
			next();
		}
	});
};

/** MIDDLEWARE FOR RETREIVING ALL RESOURCES **/
exports.getAllResources = function(req, res, next) {
	repository.all({ include_docs:true }, function(err, dbResponse) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving all resources", status: 500 }); }
		else {
			req.resources = [];
			for (var r in dbResponse.rows) {
				if (dbResponse.rows[r].id.indexOf("_") != 0) {
					req.resources.push(dbResponse.rows[r].doc);
				}
			}
			next();
		}
	});
};

/** MIDDLEWARE TO REMOVE UNPUBLISHED DOCS FROM A LIST OF RETURNED RESOURCES **/
// req.resources or req.resource must have already been set by prior middleware
exports.removeUnpublished = function(req, res, next) {
	if (!req.isAuthenticated()) {
		hasResources = req.hasOwnProperty("resources");
		if (hasResources) {
			docs = req.resources;
			req.resources = [];
		} else {
			docs = [ req.resource ];
			req.resource = null;
		}
		
		for (d in docs) {
			if (docs[d].Published) {
				if (docs.length > 1) { req.resources.push(docs[d]); }
				else (req.resource = docs[d]);
			}
		}
		
		if ((hasResources && req.resources.length == 0) || (!hasResources && req.resource == null)) {
			utils.renderToResponse(req, res, "errorResponse", { message: "Resource does not exist.", status: 404});
		} else { next(); }
	} else { next(); }
};