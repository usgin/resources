var express = require("express"),
	config = require("./config.js"),
	routeFunctions = require("./routeFunctions.js"),
	errorPage = require("./error.js");

var server = express.createServer(config.serverInfo.localListenAddress);

server.set("view engine", "jade");
server.set("view options", { layout: false });
server.use("/static", express.static(__dirname + "/static"));
server.use(express.bodyParser());

// Homepage
server.get("/", routeFunctions.main);

// Create a new resource - GET gives you a blank page to fill out. POST saves your record.
server.get("/new-resource/", routeFunctions.editResource);
server.post("/new-resource/", routeFunctions.saveResource);

// Harvest a new resource - GET gives you a page to enter a URL, POST runs the harvest routine.
server.get("/new-harvest/", routeFunctions.newHarvest);
server.post("/new-harvest/", routeFunctions.harvestResource);

// Edit an existing record, again GET for the page, POST for the saving.
server.get("/resource/:id", routeFunctions.editResource);
server.post("/resource/:id", routeFunctions.saveResource);

// Get a single record in some defined output format
server.get("/resource/:id/:format", routeFunctions.getFormattedResource);

// Get all the records in some defined output format
server.get("/resources/:format", routeFunctions.getAllRecords);

// All other requests should 404
server.get("*", function(req, res) {
	errorPage.sendErrorPage(res, 404, "Perhaps this page hasn't been created yet...");
});

// Listen to the port specified in the configuration file.
server.listen(config.serverInfo.localListenPort);
