var cradle = require("cradle"),
	config = require("./config.js"),
	errorPage = require("./error.js"),
	exports = module.exports,
	xmlParser = require("xml2json");

repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbRepoName);
collections = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbCollectionName);
harvested = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbHarvestName);

exports.getMetadata = function(id, clientResponse) {
	repository.get(id, function(err, doc) {
		context = config.defaultContext;
		if (err) { errorPage.sendErrorPage(clientResponse, 404, null, id); } 
		else {
			context.existingResource = doc;
			clientResponse.render("edit", context);
		}
	});
};

exports.saveMetadata = function(id, metadata, files, clientResponse) {
	// Set modified date
	function ISODateString(d){
		 function pad(n){return n<10 ? '0'+n : n;}
		 return d.getUTCFullYear()+'-'
		      + pad(d.getUTCMonth()+1)+'-'
		      + pad(d.getUTCDate())+'T'
		      + pad(d.getUTCHours())+':'
		      + pad(d.getUTCMinutes())+':'
		      + pad(d.getUTCSeconds())+'Z';}
	
	now = new Date();
	metadata.ModifiedDate = ISODateString(now);
	
	function dbResponse(err, dbRes) {
		if (err) {
			errorPage.sendErrorPage(clientResponse, 500, "There was an error saving the resource");
		} else {
			clientResponse.redirect("/resource/" + dbRes.id);
		}
	}
	
	if (id) {
		repository.save(id, metadata, dbResponse);
	} else {
		repository.save(metadata, dbResponse);
	}
};

function _returnXml(json, clientResponse) {
	clientResponse.contentType("application/xml");
	clientResponse.send(xmlParser.toXml(json));
}

exports.returnFormattedRecord = function(id, format, clientResponse) {
	context = config.defaultContext;
	if (format == "html") {
		repository.get(id, function(err, doc) {
			if (err) {
				errorPage.sendErrorPage(clientResponse, 404, null, id);
			} else {
				context.doc = doc;
				clientResponse.render("html-record", context);
			}
		});
		return;
	}
	
	viewName = "outputs/" + format;
	repository.view(viewName, { key: id }, function(err, dbRes) {
		if (err) { clientResponse.send(err, 500); }
		else {
			if (dbRes.rows.length == 0) {
				errorPage.sendErrorPage(clientResponse, 404, null, id);
				return;
			}
			switch(format) {
			case "geojson":
				clientResponse.json(dbRes.rows[0].value);
				break;
			case "iso":
				_returnXml(dbRes.rows[0].value, clientResponse);
				break;
			case "atom":
				_returnXml(dbRes.rows[0].value, clientResponse);
				break;
			default:
				errorPage.sendErrorPage(clientResponse, 500, "Something went wrong. Tell your server admin to make sure this output format is configured correctly.");
			}
		}
	});
};

var atomFeed;
exports.returnAllRecords = function(format, clientResponse) {
	viewName = "outputs/" + format;
	repository.all(function(err, dbResponse) {
		if (err) { errorPage.sendErrorPage(clientResponse, 500, "Error retrieving database records."); }
		else {
			ids = [], isoUrls = {};
			for (var r in dbResponse.rows) {
				id = dbResponse.rows[r].id;
				if (id.indexOf("_") != 0) { 
					ids.push(id);
					isoUrls[id] = "/resource/" + id + "/iso";
				}
			}
			if (format == "iso") { 
				context = config.defaultContext;
				context.recordUrls = isoUrls;
				clientResponse.render("waf", context);
				return;
			}
			repository.view(viewName, { keys: ids }, function(err, viewResponse) {
				if (err) { errorPage.sendErrorPage(clientResponse, 500, "Error retrieving database views"); }
				else {
					if (viewResponse.rows.length == 0) {
						errorPage.sendErrorPage(clientResponse, 404, "The resource IDs requested were invalid.");
						return;
					}
					switch (format) {
					case "geojson":
						geoCollection = { type: "FeatureCollection", features: [] };
						for (var vr in viewResponse.rows) {
							geoCollection.features.push(viewResponse.rows[vr].value);
						}
						clientResponse.json(geoCollection);
						break;
					case "atom":
						///Define a feed
						atomFeed = { feed: 
							{
								"xmlns": "http://www.w3.org/2005/Atom", 
								"xmlns:georss": "http://www.georss.org/georss", 
								//"xmlns:opensearch": "http://a9.com/-/spec/opensearch/1.1/",
								"id": { $t: config.defaultContext.orgUrl + "/resources/atom" },
								"title": { $t: "AZGS Atom Feed" },
								"author": { 
									"name": { $t: config.defaultContext.orgName }, 
									"email": { $t: config.defaultContext.helpEmail } 
								},
								"entry": []
							} 
						};
						
						///Integrate all the entries into a feed
						for (var vr in viewResponse.rows){
							var thisEntry = viewResponse.rows[vr].value;
							
							///Delete the namespaces in each entry
							delete thisEntry.entry["xmlns"];
							delete thisEntry.entry["xmlns:georss"];
							delete thisEntry.entry["xmlns:opensearch"];
							
							atomFeed.feed.entry.push(thisEntry.entry);
						}
						
						///Transform json format into xml format
						_returnXml(atomFeed, clientResponse);
						break;
					default:
						errorPage.sendErrorPage(clientResponse, 500, "Something went wrong. Tell your server admin to make sure this output format is configured correctly.");
					}					
				}
			});
		}
	});
};