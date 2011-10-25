var exports = module.exports,
	config = require("./config.js");

exports.main = function(req, res) {
	res.render("homepage", config.defaultContext);
};