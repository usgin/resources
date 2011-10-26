var express = require("express"),
	form = require("connect-form"),
	config = require("./config.js"),
	routeFunctions = require("./routeFunctions.js");

var server = express.createServer(config.serverInfo.localListenAddress, form({ keepExtensions: true }));

server.set("view engine", "jade");
server.set("view options", { layout: false });
server.use("/static", express.static(__dirname + "/static"));
server.use(express.bodyParser());

// Homepage
server.get("/", routeFunctions.main);

// Create a new resource - GET gives you a blank page to fill out. POST saves your record.
server.get("/new-resource/", routeFunctions.editResource);
server.post("/new-resource/", routeFunctions.saveResource);

// Edit an existing record, again GET for the page, POST for the saving.
server.get("/resource/:id", routeFunctions.editResource);
server.post("/resource/:id", routeFunctions.saveResource);

// Listen to the port specified in the configuration file.
server.listen(config.serverInfo.localListenPort);
