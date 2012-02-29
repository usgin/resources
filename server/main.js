var express = require("express"),
	auth = require("connect-auth"),
	authStrat = require("./authentication/authStrat.js"),
	config = require("./configuration/config.js"),
	utils = require("./configuration/utils.js"),
	retrieval = require("./db-access/retrieval.js"),
	views = require("./db-access/views.js"),
	formatting = require("./db-access/formatting.js"),
	search = require("./db-access/search.js"),
	contacts = require("./db-access/contacts.js"),
	editing = require("./db-access/editing.js"),
	harvest = require("./db-access/harvest.js"),
	collection = require("./db-access/collection.js"),
	input = require("./db-views/inputs/inputFormats.js"),
	manage = require("./db-access/manage.js");

var server = express.createServer(config.serverInfo.localListenAddress);

server.set("view engine", "jade");
server.set("view options", { layout: false });
server.use("/static", express.static("../static"));
server.use(express.cookieParser());
server.use(express.session({ secret: "fugggggles" }));
server.use(express.bodyParser());
server.use(auth( authStrat() ));

/** MIDDLEWARE FOR ROUTES REQUIRING AUTHENTICATION **/
function requireAuth(req, res, next) {
	req.authenticate(["authorizeMe"], function(err, authenticated) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: err.Reason || "error", status: 500 }); }
		else { next(); }
	});
}

/** ROUTES THAT **DO NOT** REQUIRE AUTHENTICATION **/
// Homepage
server.get("/", function(req, res) {
	utils.renderToResponse(req, res, "homepage");
});

// Search for resources
server.get("/search/:keyword?", function(req, res) {
	keyword = req.param("keyword", null);
	utils.renderToResponse(req, res, "search", { keyword: keyword });
});
server.post("/search/", search.doSearch, function(req, res) {
	res.json(req.searchResults);
});

// Get a single record in some defined output format
server.get("/resource/:id/:format", retrieval.getResource, retrieval.removeUnpublished, views.viewResource, formatting.formatResource, function(req, res) {
	res.send(req.formatResource);
});

// Get all records in some defined output format
server.get("/resources/:format", retrieval.getAllResources, retrieval.removeUnpublished, views.viewMultipleResources, formatting.formatMultipleResources, function(req, res) {
	res.send(req.formatResources);
});

// View a collection page
server.get("/collection/:id", collection.getCollection, function(req, res) {
	utils.renderToResponse(req, res, "collection", { collection: req.collection });
});

// Get some collection names
server.post("/collection-names", collection.getCollectionNames, function(req, res) {
	res.json(req.collectionNames);
});

// Search children collections
server.post("/collection-search/", collection.getChildrenCollections, function(req, res) {
	res.json(req.searchResults);
});

// Show all records in a specific collection in a specified output format
server.get("/collection/:id/:format", collection.getCollectionRecords, views.viewMultipleResources, formatting.formatMultipleResources, function(req, res) {
	res.send(req.formatResources);
});

// Browse collections page
server.get("/browse/", collection.getAllCollections, function(req, res) {
	utils.renderToResponse(req, res, "manage-collections", { collections: req.collections });
});

server.get("/robots.txt", express.static("../static/"));
server.get("/favicon.ico", express.static("../static/"));
server.get("/google*.html", express.static("../static/"));

/** ROUTES THAT **DO** REQUIRE AUTHENTICATION **/
// Get contact names
server.get("/contacts-by-name", requireAuth, contacts.getContactNames, function(req, res) {
	res.json(req.contactNames);
});

// Get details of a single contact
server.get("/contact/:id", requireAuth, contacts.getContact, function(req, res) {
	res.json(req.contact);
});

// Make a new contact
server.post("/new-contact/", requireAuth, contacts.saveNewContact, function(req, res) {
	res.json(req.saveResponse);
});

// Make a new resource
server.get("/new-resource/", requireAuth, retrieval.getResource, editing.editResource, function(req, res) {
	utils.renderToResponse(req, res, "new-edit", req.editContext);
});
server.post("/new-resource/", requireAuth, editing.saveResource, function(req, res) {
	res.redirect("/resource/" + req.saveResponse.id);
});

// Edit a resource
server.get("/resource/:id", requireAuth, retrieval.getResource, editing.editResource, function(req, res) {
	utils.renderToResponse(req, res, "edit", req.editContext);
});
server.post("/resource/:id", requireAuth, editing.saveResource, function(req, res) {
	res.redirect("/resource/" + req.saveResponse.id + "/html");
});

// Harvest a new resource
server.get("/new-harvest/", requireAuth, function(req, res) {
	utils.renderToResponse(req, res, "harvest", { inputFormats: input.stdFormatsHarvestable });
});
server.post("/new-harvest/", 
		requireAuth, 
		harvest.harvestResource, 
		harvest.saveHarvestedResource, 
		harvest.viewHarvestedResource, 
		editing.saveMultipleResources, 
		function(req, res) {
			utils.renderToResponse(req, res, "harvestResponse", { saveResponses: req.saveResponses });
		}
);

// Create a new collection
server.get("/new-collection/", requireAuth, function(req, res) {
	utils.renderToResponse(req, res, "new-collection");
});
server.post("/new-collection/", requireAuth, collection.saveCollection, function(req, res) {
	res.redirect("/collection/" + req.saveResponse.id);
});

// Management views
server.get("/manage/:id/:view", requireAuth, manage.viewResource, function(req, res) {
	utils.renderToResponse(req, res, req.template, { result: req.result });
});

// All other requests should 404
server.get("*", function(req, res) {
	utils.renderToResponse(req, res, "errorResponse", { message: "What you're looking for cannot be found. Perhaps it has not yet been created..." , status: 404 });
});

/** ROUTES THAT STILL NEED TO BE BUILT **/
// Contact webmaster
// server.get("/contact/", function(req, res) {});

// About the repository
// server.get("/about/", function(req, res) {});

// Terms of use
// server.get("/terms/", function(req, res) {});

// Metadata "rant"?
// server.get("/on-metadata/", function(req, res) {});

// Register as a user
// server.get("/register/", function(req, res) {});

// Listen to the port specified in the configuration file.
server.listen(config.serverInfo.localListenPort);
