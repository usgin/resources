var cradle = require("cradle"),
	config = require("./config.js"),
	exports = module.exports;

repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbRepoName);
collections = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbCollectionName);
harvested = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort).database(config.dbInfo.databases.dbHarvestName);

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
			clientResponse.send("Record was saved with id: " + dbRes.id);
		}
	}
	
	if (id) {
		repository.save(id, metadata, dbResponse);
	} else {
		repository.save(metadata, dbResponse);
	}
};