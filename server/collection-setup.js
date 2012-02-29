var cradle = require("cradle"),
	config = require("./configuration/config.js");

var collectionDb = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbCollectionName);

exports.buildStarterCollections = function() {
	function buildThem(collections, parentId) {
		for (var i = 0; i < collections.length; i++) {
			var collection = { 
				Title: collections[i].name, 
				Description: collections[i].description, 
				ParentCollections: parentId != null ? [ parentId ] : []
			};
			collectionDb.save(collection, function(err, saveResponse) {
				collectionDb.get(saveResponse.id, function(err, doc) {
					for (var c = 0; c < collections.length; c++) {
						if (collections[c].name == doc.Title) {
							buildThem(collections[c].children, saveResponse.id);
							break;
						}
					}
				});				
			});
		}
	}
	
	buildThem(config.starterBrowseTree, "top-level");
	
};