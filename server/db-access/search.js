var http = require("http"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	exports = module.exports;

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
				ids = [];
				for (var r in searchResults.rows) {
					ids.push(searchResults.rows[r].id);
				}
				req.searchResults = searchResults;
				req.resourceIds = ids;
				next();
			});
		}).on("error", function(err) {
			utils.renderToResponse(req, res, "errorResponse", { message: "There was an error performing the search", status: 500 });
		});
	}
};