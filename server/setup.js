var cradle = require("cradle"),
	config = require("./configuration/config.js"),
	output = require("./db-views/outputs/outputFormats.js"),
	input = require("./db-views/inputs/inputFormats.js"),
	indexes = require("./db-views/indexes.js"),
	contacts = require("./db-views/contacts.js"),
	collections = require("./db-views/collections.js");
	
var metadb = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort);

function existsCheck(db) {
	db.exists(function(err, exists) {
		if (err) {
			console.log("ERROR -- Checking for database '" + db.name + "' existence: ", err.reason); return;
		}
		
		if (exists) {
			console.log("Database '" + db.name + "' is already set up");
			saveDesignDocs(db);
		} else {
			db.create(function(err, response) {
				if (err) { console.log("ERROR -- Did not create database: " + db.name + ": " + err.reason); return; }
				else { 
					console.log("Database '" + db.name + "' was created"); 
					saveDesignDocs(db); 				
				}
			});
		}
	});
}

function saveDesignDocs(db) {
	switch (db.name) {
	case config.dbInfo.databases.dbCollectionName:
		db.save("_design/search", collections.views, function(err, response) {
			if (err) { console.log("Error creating index views in " + db.name + " database."); }
			else { console.log("Collections views up-to-date."); }
		});
		break;
	case config.dbInfo.databases.dbHarvestName:
		db.save("_design/inputs", input.views, function(err, response) {
			if (err) { console.log("Error creating input views in " + db.name + " database."); }
			else { console.log("Input views up-to-date."); }
		});
		break;
	case config.dbInfo.databases.dbRepoName:
		db.save("_design/outputs", output.views, function(err, response) {
			if (err) { console.log("Error creating output views in " + db.name + " database."); }
			else { console.log("Output views up-to-date."); }
		});
		db.save("_design/indexes", indexes.views, function(err, response) {
			if (err) { console.log("Error creating index views in " + db.name + " database."); }
			else { console.log("Index views up-to-date."); }
		});
		break;
	case config.dbInfo.databases.dbContactsName:
		db.save("_design/search", contacts.views, function(err, response) {
			if (err) { console.log("Error creating index views in " + db.name + " database."); }
			else { console.log("Contacts views up-to-date."); }
		});
	default:
		break;
	}
}

for (db in config.dbInfo.databases) {
	var thisDb = metadb.database(config.dbInfo.databases[db]);
	existsCheck(thisDb);
}