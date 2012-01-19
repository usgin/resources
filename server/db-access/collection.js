var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	exports = module.exports;

var collections = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbCollectionName);

/** MIDDLEWARE FOR SAVING A COLLECTION **/
exports.saveCollection = function(req, res, next) {
	collectionId = req.param("id", false);
	collection = { Title: req.body.collectionTitle, Description: req.body.collectionDescription };
	
	function saveResponse(err, dbRes) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error saving your collection.", status: 500 }); }
		else {
			req.saveResponse = dbRes;
			next();
		}
	}
	
	if (collectionId) {
		collections.save(collectionId, collection, saveResponse);
	} else {
		collections.save(collection, saveResponse);
	}
};

/** MIDDLEWARE FOR RETREIVING A SINGLE COLLECTION **/
exports.getCollection = function(req, res, next) {
	id = req.param("id", false);
	if (!id) { req.collection = null; next(); }
	else {
		collections.get(id, function(err, doc) {
			if (err) { utils.renderToResponse(req, res, "errorResponse", { searchedId: id, status: 404 }); } 
			else {
				req.collection = doc;
				next();
			}
		});
	}
};

/** MIDDLEWARE FOR RETREIVING ALL COLLECTIONS **/
exports.getAllCollections = function(req, res, next) {
	collections.all({ include_docs: true }, function(err, dbRes) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving collections", status: 500 }); }
		else {
			req.collections = [];
			for (r in dbRes.rows) {
				if (dbRes.rows[r].id.indexOf("_") != 0) { req.collections.push(dbRes.rows[r]); }
			}
			next();
		}
	});
};

/** MIDDLEWARE FOR RETREIVING THE NAMES OF A SET OF COLLECTIONS **/
exports.getCollectionNames = function(req, res, next) {
	if (!req.body.hasOwnProperty("ids")) { req.body.ids = "all"; }
	keyObj = req.body.ids == "all" ? {} : { keys: req.body.ids };
	collections.view("search/title", keyObj, function(err, viewResponse) {
		if (err) { res.json({ error: "Error retrieving view of collections" }); }
		else {
			req.collectionNames = viewResponse.rows;
			next();
		}
	});
};