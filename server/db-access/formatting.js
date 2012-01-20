var xmlParser = require("xml2json"),
	utils = require("../configuration/utils.js"),
	config = require("../configuration/config.js"),
	output = require("../db-views/outputs/outputFormats.js"),
	exports = module.exports;

function configXmlResponse(req, res, propName, json) {
	res.contentType("application/xml");
	req[propName] = '<?xml version="1.0" encoding="utf-8"?>\n' + xmlParser.toXml(json);
}

function applyFeedSettings(json) {
	json.feed.xmlns = "http://www.w3.org/2005/Atom";
	json.feed["xmlns:georss"] = "http://www.georss.org/georss";
	json.feed["xmlns:scast"] = "http://sciflo.jpl.nasa.gov/serviceCasting/2009v1";
	json.feed.id = { "$t": config.organizationInfo.orgUrl + "/resources/atom" };
	json.feed.title = { "$t": config.organizationInfo.orgName + " Atom Feed" };
	json.feed.updated = { "$t": utils.getCurrentDate() };
	json.feed.author = {
		name: { "$t": config.organizationInfo.orgName }, 
		email: { "$t": config.organizationInfo.orgEmail } 
	};
	entries = json.feed.entry; delete json.feed.entry; json.feed.entry = entries;
}

/** MIDDLEWARE FOR FORMATTING A SINGLE RESOURCE **/
// Assumes that format validity has been checked by prior middleware.
// req.resource must have already been set by prior middleware.
// req.viewResource must have already been set by prior middleware.
exports.formatResource = function(req, res, next) {	
	format = req.param("format", null);
	switch(format) {
	case "html":
		utils.renderToResponse(req, res, "html-record", { 
				doc: req.resource,
				outputFormats: output.stdFormatsAvailable
			});
		break;
	case "geojson":
		res.contentType("application/json");
		req.formatResource = req.viewResource;
		next();
		break;
	case "iso.xml":
		configXmlResponse(req, res, "formatResource", req.viewResource);
		next();
		break;
	case "atom.xml":
		applyFeedSettings(req.viewResource);
		configXmlResponse(req, res, "formatResource", req.viewResource);
		next();
		break;
	default:
		utils.renderToResponse(req, res, "errorResponse", { message: "Failed to format your resource. Tell your server admin to make sure this output format is configured correctly.", status: 500 });
		break;
	}
};

/** MIDDLEWARE FOR FORMATTING MULTIPLE RESOURCES **/
// Assumes that format validity has been checked by prior middleware.
// Assumes that ISO formatted records have already been handled by prior middleware.
// req.viewResources must have already been set by prior middleware.
exports.formatMultipleResources = function(req, res, next) {
	format = req.param("format", null);
	switch (format) {
	case "geojson":
		req.formatResources = { type: "FeatureCollection", features: [] };
		for (var vr in req.viewResources) {
			req.formatResources.features.push(req.viewResources[vr].value);
		}
		next();
		break;
	case "atom.xml":
		atomFeed = { feed: { entry: [] } };
		for (var vr in req.viewResources){
			var thisEntry = req.viewResources[vr].value.feed.entry;
			atomFeed.feed.entry.push(thisEntry);													
		}
		
		applyFeedSettings(atomFeed);
		configXmlResponse(req, res, "formatResources", atomFeed);
		next();
		break;
	default:
		utils.renderToResponse(req, res, "errorResponse", { message: "Failed to format your resources. Tell your server admin to make sure this output format is configured correctly.", status: 500 });
	}					
		
};