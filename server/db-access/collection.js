var cradle = require("cradle"),
	http = require("http"),
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

/** MIDDLEWARE FOR RETREIVING TOP LEVEL COLLECTIONS **/
exports.getTopLevelCollections = function(req, res, next) {
	searchOptions = {
		host: config.dbInfo.dbHost,
		port: config.dbInfo.dbPort,
		path: utils.collectionSearchUrl + "parent?include_docs=true&q=top-level"
	};
	
	//req.collections = [];
	http.get(searchOptions, function(searchResponse) {
		searchData = "";
		searchResponse.on("data", function(chunk) { searchData += chunk; });
		searchResponse.on("end", function() {
			req.collections = [];
			rows = JSON.parse(searchData).rows;
			for (var i in rows) { req.collections.push({ id: rows[i].doc._id, doc: rows[i].doc }); }
			next();
		});
	}).on("error", function(err) {
		utils.renderToResponse(req, res, "errorResponse", { message: "There was an error performing the search", status: 500 });
	});
};

/** MIDDLEWARE FOR RETREIVING THE RECORDS IN A SPECIFIC COLLECTION **/
exports.getCollectionRecords = function(req, res, next) {
	collectionId = req.param("id", false);
	if (collectionId) {
		searchOptions = {
			host: config.dbInfo.dbHost,
			port: config.dbInfo.dbPort,
			path: utils.searchUrl + "collection?include_docs=true&q=" + collectionId
		};
		
		// If the request is not authenticated, do not return unpublished records
		if (!req.isAuthenticated()) { searchOptions.path += "%20AND%20published:true"; }
		
		http.get(searchOptions, function(searchResponse) {
			searchData = "";
			searchResponse.on("data", function(chunk) { searchData += chunk; });
			searchResponse.on("end", function() {
				req.resources = []; searchedRows = JSON.parse(searchData).rows;
				for (r in searchedRows) { req.resources.push(searchedRows[r].doc); }
				next();
			});
		}).on("error", function(err) {
			utils.renderToResponse(req, res, "errorResponse", { message: "There was an error performing the search", status: 500 });
		});
	} else {
		utils.renderToResponse(req, res, "errorResponse", { message: "Please provide a valid collection Id in your request", status: 400 });
	}
};

/** MIDDLEWARE FOR SEARCHING FOR A COLLECTION **/
exports.getChildrenCollections = function(req, res, next) {
	searchObj = req.body;
	queryParams = "?include_docs=true&";
	if (searchObj.hasOwnProperty("limit")) { queryParams += "limit=" + searchObj.limit + "&"; }
	if (searchObj.hasOwnProperty("skip")) { queryParams += "skip=" + searchObj.skip + "&"; }
	searchOptions = {
		host: config.dbInfo.dbHost,
		port: config.dbInfo.dbPort,
		path: utils.collectionSearchUrl + searchObj.index + queryParams + "q=" + searchObj.terms
	};
	
	http.get(searchOptions, function(searchResponse) {
		searchData = "";
		searchResponse.on("data", function(chunk) { searchData += chunk; });
		searchResponse.on("end", function() {
			req.searchResults = JSON.parse(searchData);
			next();
		});
	}).on("error", function(err) {
		utils.renderToResponse(req, res, "errorResponse", { message: "There was an error performing the search", status: 500 });
	});
};

/** MIDDLEWARE FOR DELETING A RESOURCE **/
exports.deleteCollection = function(req, res, next) {
	collectionId = req.param("id", false);
	if (collectionId) {
		collections.get(id, function(err, doc) {
			if (err) { res.json({ id: collectionId, deleted: false, reason: err }); }
			else { 
				collections.remove(id, doc._rev, function(err, deleteRes) {
					if (err) { res.json({ id: collectionId, deleted: false, reason: err }); }
					else { next(); }
				});
			}
		});
	} else {
		res.json({ id: "none", deleted: false, reason: "No valid id was given" });
	}
};