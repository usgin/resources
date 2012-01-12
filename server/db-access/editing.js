var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js");

var repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbRepoName);

/** MIDDLEWARE FOR EDITING A RESOURCE **/
// req.resource must have already been set by prior middleware.
exports.editResource = function(req, res, next) {
	req.editContext = { existingResource: req.resource };
	req.editContext.contactTemplate = JSON.stringify(utils.examples["http://resources.usgin.org/uri-gin/usgin/schema/json-metadata-contact/"]);
	req.editContext.fileLinkTemplate = JSON.stringify(utils.examples["http://resources.usgin.org/uri-gin/usgin/schema/json-link/"]);
	req.editContext.serviceLinkTemplate = JSON.stringify(utils.examples["http://resources.usgin.org/uri-gin/usgin/schema/json-service-link/"]);
	req.editContext.metadataTemplate = JSON.stringify(utils.examples["http://resources.usgin.org/uri-gin/usgin/schema/json-metadata/"]);
	next();
};

/** MIDDLEWARE FOR SAVING A RESOURCE **/
exports.saveResource = function(req, res, next) {
	resourceId = req.param("id", false);
	metadata = JSON.parse(req.body.theResource);
	metadata.ModifiedDate = utils.getCurrentDate();
	
	function saveResponse(err, dbRes) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error saving your resource.", status: 500 }); }
		else {
			req.saveResponse = dbRes;
			next();
		}
	}
	
	if (resourceId) {
		repository.save(resourceId, metadata, saveResponse);
	} else {
		repository.save(metadata, saveResponse);
	}
};

/** MIDDLEWARE FOR SAVING MULTIPLE RESOURCES **/
// req.resources must have already been set by prior middleware.
exports.saveMultipleResources = function(req, res, next) {
	function completionCheck() {
		if (req.saveResponses.length == req.resources.length) { next(); }
	}
	
	req.saveResponses = [];
	for (var r in req.resources) {
		if (!req.resources[r]) { 
			req.saveResponses.push(null); 
			completionCheck();
			continue;
		}
		repository.save(req.resources[r], function(err, dbRes) {
			req.saveResponses.push(dbRes);
			completionCheck();
		});
	}
};