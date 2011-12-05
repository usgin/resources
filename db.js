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

function _getCurrentDate() {
	function ISODateString(d){
		 function pad(n){return n<10 ? '0'+n : n;}
		 return d.getUTCFullYear()+'-'
		      + pad(d.getUTCMonth()+1)+'-'
		      + pad(d.getUTCDate())+'T'
		      + pad(d.getUTCHours())+':'
		      + pad(d.getUTCMinutes())+':'
		      + pad(d.getUTCSeconds())+'Z';}
	
	now = new Date();
	return ISODateString(now);
}

_saveMetadata = function(id, metadata, files, clientResponse, doNotRedirect, customResponseFunction) {
	metadata.ModifiedDate = _getCurrentDate();
	
	function dbResponse(err, dbRes) {
		if (err) {
			errorPage.sendErrorPage(clientResponse, 500, "There was an error saving the resource");
		} else if (!doNotRedirect) {
			clientResponse.redirect("/resource/" + dbRes.id);
		} else if (customResponseFunction && doNotRedirect) {
			customResponseFunction(clientResponse);
		}
	}
	
	if (id) {
		repository.save(id, metadata, dbResponse);
	} else {
		repository.save(metadata, dbResponse);
	}
};

exports.saveMetadata = _saveMetadata;

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
		if (err) { errorPage.sendErrorPage(clientResponse, 500, "Error retrieving database records."); }
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
								"xmlns:scast": "http://sciflo.jpl.nasa.gov/serviceCasting/2009v1",
								"id": { $t: config.defaultContext.orgUrl + "/resources/atom" },
								"title": { $t: "AZGS Atom Feed" },
								"author": { 
									"name": { $t: config.defaultContext.orgName }, 
									"email": { $t: config.defaultContext.helpEmail } 
								},
								"updated": { $t: _getCurrentDate() },
								"entry": []
							} 
						};
						
						///Integrate all the entries into a feed
						for (var vr in viewResponse.rows){
							var thisEntryList = viewResponse.rows[vr].value.entry;
						
							for(var e in thisEntryList){
								thisEntry = thisEntryList[e];
								///Delete the namespaces in each entry
								delete thisEntry["xmlns"];
								delete thisEntry["xmlns:georss"];
								delete thisEntry["xmlns:opensearch"];
								delete thisEntry["xmlns:scast"];
								
								atomFeed.feed.entry.push(thisEntry);
							}							
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

_harvestResponse = function(clientResponse) {
	clientResponse.send("The harvest completed successfully");
};

_saveHarvestedRecord = function(jsonData, clientResponse, format, harvestUrl, sendResponse) {
	harvested.save(jsonData, function(err, dbResponse) {
		if (err) { errorPage.sendErrorPage(clientResponse, 500, "An error occurred saving data to the harvest table."); }
		else {
			harvested.view("inputs/" + format, { key: dbResponse.id }, function(err, dbRes) {
				if (err) { errorPage.sendErrorPage(clientResponse, 500, "An error occurred retrieving a view from the harvest table."); }
				else {
					storageJson = dbRes.rows[0].value;
					storageJson["HarvestInformation"]["HarvestRecordId"] = dbResponse.id;
					storageJson["HarvestInformation"]["HarvestURL"] = harvestUrl;
					storageJson["HarvestInformation"]["HarvestDate"] = _getCurrentDate();
					
					if (sendResponse) { _saveMetadata(null, storageJson, null, clientResponse, true, _harvestResponse); }
					else { _saveMetadata(null, storageJson, null, clientResponse, true); }
				}
			});
		}
		
	});
};

exports.saveHarvestedRecords = function(jsonData, clientResponse, format, harvestUrl) {
	switch (format) {
	case "atom":
		entries = jsonData.feed.entry || [];
		if (entries.length == 0) {
			errorPage.sendErrorPage(clientResponse, 200, "The feed did not contain any entries.");
		}
		for (var e in entries) {
			if (e == entries.length - 1) { _saveHarvestedRecord(entries[e], clientResponse, format, harvestUrl, true); }
			else { _saveHarvestedRecord(entries[e], clientResponse, format, harvestUrl); }
		}
		break;
	case "iso":
		break;
	}
};