var url = require("url"),
	express = require("express"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js");

module.exports = function(options) {
	options = options || {};
	var authObj = {};
	
	authObj.name = options.name || "authorizeMe";
	
	function failed_validation(req, res, uri) {
		var parsedUrl = url.parse(req.url, true);
		var redirectUrl = "/login";
		if (uri) {
			redirectUrl = redirectUrl + "?redirect_url=" + uri;
		} else if (parsedUrl.query && parsedUrl.query.redirect_url) {
			redirectUrl = redirectUrl + "?redirect_url=" + parsedUrl.query.redirect_url;
		}
		res.redirect(redirectUrl, 303);
	}
	
	function validate_credentials( executionScope, req, res, callback) {
		setTimeout(function() {
			if (req.body && req.body.user && req.body.password) {
				if (req.body.user == config.userInfo.adminUser && req.body.password == config.userInfo.adminSecret) {
					executionScope.success({ name: req.body.user }, callback);
				} else {
					executionScope.fail(callback);
				}
			} else {
				failed_validation(req, res);
			}
		}, 100);
	}
	
	authObj.authenticate = function(req, res, callback) {
		if (req.body && req.body.user && req.body.password) {
			validate_credentials(this, req, res, callback);
		} else {
			failed_validation(req, res, req.url);
		}
	};
	authObj.setupRoutes = function(server) {
		server.use(express.router(function routes(app) {
			app.post("/login", function(req, res) {
				req.authenticate([authObj.name], function(err, authenticated) {
					var redirectUrl = "/";
					if (!authenticated) { redirectUrl = "/login/failed"; }
					var parsedUrl = url.parse(req.url, true);															
					if (parsedUrl.query && parsedUrl.query.redirect_url) {
						if (authenticated) { redirectUrl = parsedUrl.query.redirect_url; }
						else { redirectUrl += "?redirect_url=" + parsedUrl.query.redirect_url; }
					}
					res.redirect(redirectUrl, 303);
								
				});
			});
			
			app.get("/login/:failed?", function(req, res) {
				var parsedUrl = url.parse(req.url, true);
				var redirectUrl = "";
				if (parsedUrl.query && parsedUrl.query.redirect_url) {
					redirectUrl = "?redirect_url=" + parsedUrl.query.redirect_url;
				}
				context = { redirectUrl: redirectUrl, failed: false };
				if (req.param("failed", "") == "failed") { context.failed = true; }
				utils.renderToResponse(req, res, "login", context);			
			});
		}));
	};
	
	return authObj;
};