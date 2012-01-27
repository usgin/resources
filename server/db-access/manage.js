var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	exports = module.exports;

var repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbRepoName);

/** MIDDLEWARE FOR RETREIVING A SINGLE RESOURCE THROUGH A PARTICULAR MANAGEMENT VIEW **/
exports.viewResource = function(req, res, next) {
	id = req.param("id", null);
	view = req.param("view", null);
	
	repository.view("manage/" + view, { key: id }, function(err, dbRes) {
		if (err) { res.json({ message: "Error retrieving view from the database", status: 500 }); }
		else {
			if (dbRes.rows.length == 0) { res.json({ message: "No record was found", status: 404 }); } 
			else { 
				req.result = dbRes.rows[0].value; 
				req.template = "record-" + view;
				next();
			}			
		}
	});
};