var cradle = require("cradle"),
	http = require("http"),
	urlParser = require("url"),
	parser = require("xml2json"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js");

var harvested = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbHarvestName);

function validateInputFormat(input, data) {
	try { inputJson = parser.toJson(data, { object: true, reversible: true }); }
	catch(err) { return [false, "URL returned an invalid XML document."]; }
	
	switch (input) {
	case "atom":
		if (inputJson.hasOwnProperty("feed")) {
			return [true, inputJson];
		} else { return [false, "URL did not return a valid Atom Feed."]; }
	case "iso":
		if (inputJson.hasOwnProperty("gmd:MD_Metadata")) {
			return [true, inputJson];
		} else { return [false, "URL did not return a valid ISO 19139 XML document."]; }
	}
}

/** MIDDLEWARE TO HARVEST AN EXTERNAL RESOURCE **/
exports.harvestResource = function(req, res, next) {
	if (!req.body.harvestFormat) {
		res.redirect("/new-harvest/");
	} else {
		urlBits = urlParser.parse(req.body.url, false, true);
		getOptions = { host: urlBits.hostname, port: (urlBits.port || 80), path: urlBits.pathname + ( urlBits.search || "" ) };
		http.get(getOptions, function(proxyResponse) {
			data = "";
			proxyResponse.on("data", function(chunk) { data += chunk; });
			proxyResponse.on("end", function() {
				formatted = validateInputFormat(req.body.harvestFormat, data);
				if (!formatted[0]) { utils.renderToResponse(req, res, "errorResponse", { message: formatted[1], status: 500 }); } 
				else {
					req.harvestedJson = formatted[1];
					next();
				}
			});
		}).on("error", function(err) {
			utils.renderToResponse(req, res, "errorResponse", { message: "The URL you entered was invalid. Please try again." });
		});
	}	
};

/** MIDDLEWARE FOR SAVING A HARVESTED RESOURCE **/
//req.harvestedJson must have already been set by prior middleware.
exports.saveHarvestedResource = function(req, res, next) {
	switch (req.body.harvestFormat) {
	case "atom":
		entryConString = req.harvestedJson.feed.entry.constructor.toString();
		if (entryConString.indexOf("Array") != -1) {
			entries = req.harvestedJson.feed.entry;
		} else if (entryConString.indexOf("Object") != -1) {
			entries = [ req.harvestedJson.feed.entry ];
		} else { entries = []; }
		
		function checkCompletion() {
			if (req.harvestIds.length == entries.length) { next(); }
		}
		
		req.harvestIds = [];
		for (var e in entries) { 
			harvested.save(entries[e], function(err, dbRes) {
				if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error saving your harvested resource.", status: 500 }); }
				else {
					req.harvestIds.push(dbRes.id);
					checkCompletion();
				}
			});
		}
		break;
	case "iso":
		harvested.save(req.harvestedJson, function(err, dbRes) {
			if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error saving your harvested resource.", status: 500 }); }
			else {
				req.harvestId = dbRes.id;
				next();
			}
		});
	}
};

/** MIDDLEWARE FOR RETREIVING A SINGLE HARVESTED RESOURCE THROUGH A PARTICULAR INPUT VIEW **/
//req.harvestId or req.harvestIds must have already been set by prior middleware.
exports.viewHarvestedResource = function(req, res, next) {
	function completionCheck() {
		if (req.resources.length == ids.length) { next(); }
	}
	req.resources = [], ids = req.harvestIds || [ req.harvestId ];
	for (var i in ids) {
		harvested.view("inputs/" + req.body.harvestFormat, { key: ids[i] }, function(err, dbRes) {
			if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving views from the harvest database", status: 500 }); }
			else {
				if (dbRes.length == 0) { req.resources.push(null); }
				else {
					theResource = dbRes[0].value;
					if (!theResource.hasOwnProperty("HarvestInformation")) { theResource.HarvestInformation = {}; }
					theResource.HarvestInformation.HarvestRecordId = req.harvestId;
					theResource.HarvestInformation.HarvestURL = req.body.url;
					theResource.HarvestInformation.HarvestDate = utils.getCurrentDate();
					
					req.resources.push(theResource);					
				}
				completionCheck();
			}
		});
	}
};