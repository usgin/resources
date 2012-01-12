var cradle = require("cradle"),
	http = require("http"),
	xmlParser = require("xml2json"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	output = require("../db-views/outputFormats.js"),
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
		formatsAvailable = [];
		for (var k in output.stdFormatsAvailable) { formatsAvailable.push(k); }
		utils.renderToResponse(req, res, "errorResponse", { message: "You requested an invalid format. You can request one of: " + formatsAvailable, status: 400 });
	}
};

/** MIDDLEWARE FOR FORMATTING A RESOURCE **/
exports.formatResource = function(req, res, next) {
	format = req.param("format", null);
	switch(format) {
	case "html":
		utils.renderToResponse(req, res, "html-record", { doc: req.resource });
		break;
	case "geojson":
		res.contentType("application/json");
		req.formatResource = req.viewResource;
		next();
		break;
	case "iso":
		res.contentType("application/xml");
		req.formatResource = '<?xml version="1.0" encoding="utf-8"?>\n' + xmlParser.toXml(req.viewResource);
		next();
		break;
	case "atom":
		res.contentType("application/xml");
		req.formatResource = '<?xml version="1.0" encoding="utf-8"?>\n' + xmlParser.toXml(req.viewResource);
		next();
		break;
	default:
		utils.renderToResponse(req, res, "errorResponse", { message: "Failed to format your resource. Tell your server admin to make sure this output format is configured correctly.", status: 500 });
		break;
	}
};

/** MIDDLEWARE FOR RETREIVING MULTIPLE RESOURCES **/
exports.getMultipleResources = function(req, res, next) {
	repository.get(req.getMultipleIds, function(err, records) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving resources", status: 500}); }
		else {
			req.resources = records;
			next();
		}
	});
};

/** MIDDLEWARE FOR PERFORMING A SEARCH FOR RESOURCES **/
exports.doSearch = function(req, res, next) {
	searchObj = req.body;
	if (searchObj.hasOwnProperty("full")) {
		searchOptions = {
			host: config.dbInfo.dbHost,
			port: config.dbInfo.dbPort,
			path: utils.searchUrl + "full?q=" + searchObj.full
		};
		
		http.get(searchOptions, function(searchResponse) {
			searchData = "";
			searchResponse.on("data", function(chunk) { searchData += chunk; });
			searchResponse.on("end", function() {
				searchResults = JSON.parse(searchData);
				console.log(searchResults);
				ids = [];
				for (var r in searchResults.rows) {
					ids.push(searchResults.rows[r].id);
				}
				req.searchResults = searchResults;
				req.getMultipleIds = ids;
				next();
			});
		}).on("error", function(err) {
			utils.renderToResponse(req, res, "errorResponse", { message: "There was an error performing the search", status: 500 });
		});
	}
};