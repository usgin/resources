var cradle = require("cradle"),
	http = require("http"),
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