var cradle = require("cradle"),
	config = require("./config.js"),
	exports = module.exports,
	xmlParser = require("xml2json");

repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbRepoName);
collections = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbCollectionName);
harvested = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbHarvestName);

exports.getMetadata = function(id, clientResponse) {
	repository.get(id, function(err, doc) {
		context = config.defaultContext;
		if (err) {
			context.searchedId = id;
			context.status = 404;
			clientResponse.render("errorResponse", context);
		} else {
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
			clientResponse.send(err, 500);
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
				context.searchedId = id;
				context.status = 404;
				clientResponse.render("errorResponse", context);
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
				context.message = "The resource ID requested was invalid.";
				context.status = 404;
				clientResponse.render("errorResponse", context);
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
				context.message = "Something went wrong. Tell your server admin to make sure this output format is configured correctly.";
				context.status = 500;
				clientResponse.render("errorResponse", context);
			}
		}
	});
};

exports.returnAllRecords = function(format, clientResponse) {
	viewName = "outputs/" + format;
	repository.all(function(err, dbResponse) {
		if (err) { clientResponse.send(err, 500); }
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
				if (err) { clientResponse.send(err, 500); }
				else {
					if (dbRes.rows.length == 0) {
						context.message = "The resource IDs requested were invalid.";
						context.status = 404;
						clientResponse.render("errorResponse", context);
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
					default: 
						context.message = "Something went wrong. Tell your server admin to make sure this output format is configured correctly.";
						context.status = 500;
						clientResponse.render("errorResponse", context);
					}					
				}
			});
		}
	});
};