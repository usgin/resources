var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	exports = module.exports;

var repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbRepoName);

/** MIDDLEWARE FOR RETREIVING A SINGLE RESOURCE **/
exports.getResource = function(req, res, next) {
	id = req.param("id", null);
	repository.get(id, function(err, doc) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { searchedId: id, status: 404 }); } 
		else {
			req.resource = doc;
			next();
		}
	});
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
	repository.all(function(err, dbResponse) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving all resources", status: 500 }); }
		else {
			req.resources = dbResponse.rows;
			req.resourceIds = [];
			for (var r in dbResponse.rows) {
				thisId = dbResponse.rows[r].id;
				if (thisId.indexOf("_") != 0) { req.resourceIds.push(thisId); }
				
			}
			next();
		}
	});
};