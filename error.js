var exports = module.exports,
	config = require("./config.js");

exports.sendErrorPage = function(clientResponse, status, message, searchedId) {
	context = config.defaultContext;
	context.status = status;
	context.message = message;
	context.searchedId = searchedId;
	
	clientResponse.render("errorResponse", context);
};