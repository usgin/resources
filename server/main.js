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
	input = require("./db-views/inputs/inputFormats.js");

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
server.get("/search/", function(req, res) {
	utils.renderToResponse(req, res, "search", { searchUrl: utils.searchUrl });
});
server.post("/search/", search.doSearch, retrieval.getMultipleResources, function(req, res) {
	res.json(req.resources);
});

// Get a single record in some defined output format
server.get("/resource/:id/:format", retrieval.getResource, views.viewResource, formatting.formatResource, function(req, res) {
	res.send(req.formatResource);
});

// Get all records in some defined output format
server.get("/resources/:format", retrieval.getAllResources, views.viewMultipleResources, formatting.formatMultipleResources, function(req, res) {
	res.send(req.formatResources);
});

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
	utils.renderToResponse(req, res, "edit", req.editContext);
});
server.post("/new-resource/", requireAuth, editing.saveResource, function(req, res) {
	res.redirect("/resource/" + req.saveResponse.id);
});

// Edit a resource
server.get("/resource/:id", requireAuth, retrieval.getResource, editing.editResource, function(req, res) {
	utils.renderToResponse(req, res, "edit", req.editContext);
});
server.post("/resource/:id", requireAuth, editing.saveResource, function(req, res) {
	res.redirect("/resource/" + req.saveResponse.id);
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

// All other requests should 404
server.get("*", function(req, res) {
	utils.renderToResponse(req, res, "errorResponse", { message: "What you're looking for cannot be found. Perhaps it has not yet been created..." , status: 404 });
});

// Listen to the port specified in the configuration file.
server.listen(config.serverInfo.localListenPort);