var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	exports = module.exports;

var collections = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbCollectionName);

/** MIDDLEWARE FOR SAVING A COLLECTION **/
exports.saveCollection = function(req, res, next) {
	collectionId = req.param("id", false);
	collection = { Title: req.body.collectionTitle, Description: req.body.collectionDescription };
	
	function saveResponse(err, dbRes) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error saving your collection.", status: 500 }); }
		else {
			req.saveResponse = dbRes;
			next();
		}
	}
	
	if (collectionId) {
		collections.save(collectionId, collection, saveResponse);
	} else {
		collections.save(collection, saveResponse);
	}
};