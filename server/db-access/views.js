var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	output = require("../db-views/outputs/outputFormats.js"),
	exports = module.exports;

var repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbRepoName);
var harvested = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbHarvestName);
var collections = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbCollectionName);

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
					if (format == "iso.xml") { // ISO records should contain some keywords about what collection they come from. This way we could feasibly build a browse tree from keywords in ISO records. Maybe.
						var outputKeywords = req.viewResource["gmd:MD_Metadata"]["gmd:identificationInfo"]["gmd:MD_DataIdentification"]["gmd:descriptiveKeywords"];
						var newKeywords = [];
						
						// ISO is fucking stupid.
						outputKeywords.push({
							"gmd:MD_Keywords": {
								"gmd:keyword": newKeywords,
								"gmd:thesaurusName": {
									"xlink:href": "http://" + config.serverInfo.serverHostname + "/browse/",
									"gmd:CI_Citation": {
										"gmd:title": {
											"gco:CharacterString": {
												"$t": config.serverInfo.serverName + " collections"
											}										
										}, 
										"gmd:date": {
											"gmd:CI_Date": {
												"gmd:date": {
													"gco:Date": {
														"$t": "2012-04-06"
													}
												},
												"gmd:dateType": {
													"gmd:CI_DateTypeCode": {
														"codeList": "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#CI_DateTypeCode",
														"codeListValue": "publication"
													}
												}
											}
										}
									}
								}
							}
						});
						
						var collectionIds = req.resource.Collections || [];
						var collectionNames = [];
						for (var c in collectionIds) {
							thisId = collectionIds[c];
							collections.get(thisId, function(err, doc) {
								collectionNames.push(doc ? doc.Title || "" : "");
								if (collectionNames.length == collectionIds.length) {
									for (var cn in collectionNames) {
										newKeywords.push({
											"gco:CharacterString": {
												"$t": collectionNames[cn]
											}
										});
									}
									next(); // Your ISO record is ready, chap.
								}
							});
						}
					} else { // Not ISO, don't have to deal with that nonsense.
						next();
					}					
				}
			});
		}
	} else {
		invalidFormatRequested(req, res);
	}
};

/** MIDDLEWARE FOR RETREIVING MULTIPLE RESOURCES THROUGH A PARTICULAR VIEW **/
// req.resources must have already been set by prior middleware.
exports.viewMultipleResources = function(req, res, next) {	
	format = req.param("format", null);
	if (format in output.stdFormatsAvailable) {
		// ISO is a special case that does not require any db-views
		if (format == "iso.xml") {
			addContext = { recordUrls: [] };
			for (var i in req.resources) { addContext.recordUrls.push("/resource/" + req.resources[i]["_id"] + "/" + format); }
			utils.renderToResponse(req, res, "waf", addContext);
		} 
		// sitemap.xml is another special case that does not require any db-views
		else if (format == "sitemap.xml") {
			addContext = { recordUrls: [] };
			for (var i in req.resources) { addContext.recordUrls.push("http://" + config.serverInfo.serverHostname + "/resource/" + req.resources[i]["_id"] + "/html"); }
			res.contentType("application/xml");
			utils.renderToResponse(req, res, "sitemap", addContext);
		} else {
			resourceIds = [];
			for (var i in req.resources) { resourceIds.push(req.resources[i]["_id"]); }
			repository.view("outputs/" + format, { keys: resourceIds }, function(err, viewResponse) {
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