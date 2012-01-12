var express = require("express"),
	auth = require("connect-auth"),
	authStrat = require("./authentication/authStrat.js"),
	config = require("./configuration/config.js"),
	utils = require("./configuration/utils.js");
	//routeFunctions = require("./routeFunctions.js"),
	//errorPage = require("./error.js");

var server = express.createServer(config.serverInfo.localListenAddress);

server.set("view engine", "jade");
server.set("view options", { layout: false });
server.use("/static", express.static("../static"));
server.use(express.cookieParser());
server.use(express.session({ secret: "fugggggles" }));
server.use(express.bodyParser());
server.use(auth( authStrat() ));

// Homepage
server.get("/", function(req, res) {
	utils.renderToResponse(req, res, "homepage");
});

// All other requests should 404
server.get("*", function(req, res) {
	utils.renderToResponse(req, res, "errorResponse", { message: "What you're looking for cannot be found. Perhaps it has not yet been created..." , status: 404 });
});

// Listen to the port specified in the configuration file.
server.listen(config.serverInfo.localListenPort);
