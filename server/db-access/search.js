var http = require("http"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	exports = module.exports;

/** MIDDLEWARE FOR PERFORMING A SEARCH FOR RESOURCES **/
exports.doSearch = function(req, res, next) {
	searchObj = req.body;
	queryParams = "?include_docs=true&";
	if (searchObj.hasOwnProperty("limit")) { queryParams += "limit=" + searchObj.limit + "&"; }
	else { queryParams += "limit=999999&"; }
	if (searchObj.hasOwnProperty("skip")) { queryParams += "skip=" + searchObj.skip + "&"; }
	searchOptions = {
		host: config.dbInfo.dbHost,
		port: config.dbInfo.dbPort,
		path: utils.searchUrl + searchObj.index + queryParams + "q=" + searchObj.terms
	};
	
	// If the request is not authenticated, do not return unpublished records
	if (!req.isAuthenticated()) { searchOptions.path += "%20AND%20published:true"; }
	
	http.get(searchOptions, function(searchResponse) {
		searchData = "";
		searchResponse.on("data", function(chunk) { searchData += chunk; });
		searchResponse.on("end", function() {
			req.searchResults = JSON.parse(searchData);
			next();
		});
	}).on("error", function(err) {
		utils.renderToResponse(req, res, "errorResponse", { message: "There was an error performing the search", status: 500 });
	});
};