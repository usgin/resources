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

function _returnXml(dbResponse, clientResponse) {
	json = dbResponse.rows[0].value;
	clientResponse.contentType("application/xml");
	clientResponse.send(xmlParser.toXml(json));
}

exports.returnFormattedRecord = function(id, format, clientResponse) {
	viewName = "outputs/" + format;
	repository.view(viewName, { key: id }, function(err, dbRes) {
		if (err) { clientResponse.send(err, 500); }
		else {
			context = config.defaultContext;
			switch(format) {
			case "geojson":
				clientResponse.json(dbRes.rows[0].value);
				break;
			case "iso":
				_returnXml(dbRes, clientResponse);
				break;
			case "atom":
				//clientResponse.json(dbRes.rows[0].value);
				_returnXml(dbRes, clientResponse);
				break;
			default:
				context.message = "Something went wrong. Tell your server admin to make sure this output format is configured correctly.";
				context.status = 500;
				clientResponse.render("errorResponse", context);
			}
		}
	});
};