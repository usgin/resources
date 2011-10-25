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

server.listen(config.serverInfo.localListenPort);
