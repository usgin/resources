var cradle = require("cradle"),
	config = require("./config.js");

var metadb = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort);

function existsCheck(db) {
	db.exists(function(err, exists) {
		if (err) {
			console.log("ERROR -- Checking for database '" + db.name + "' existence: ", err.reason); return;
		}
		
		if (exists) {
			console.log("Database '" + db.name + "' is already set up");
			//saveDesignDocs(db);
		} else {
			db.create(function(err, response) {
				if (err) { console.log("ERROR -- Did not create database: " + db.name + ": " + err.reason); return; }
				else { 
					console.log("Database '" + db.name + "' was created"); 
					//saveDesignDocs(db); 				
				}
			});
		}
	});
}

for (db in config.dbInfo.databases) {
	var thisDb = metadb.database(config.dbInfo.databases[db]);
	existsCheck(thisDb);
}