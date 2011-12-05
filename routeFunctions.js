var exports = module.exports,
	config = require("./config.js"),
	db = require("./db.js"),
	output = require("./db-views/outputs/outputFormats.js"),
	input = require("./db-views/inputs/inputFormats.js"),
	errorPage = require("./error.js"),
	http = require("http"),
	parser = require("xml2json"),
	urlParser = require("url");

// Front Page:
exports.main = function(req, res) {
	res.render("homepage", config.defaultContext);
};


// Editing Page:
exports.editResource = function(req, res) {	
	existingId = req.param("id", null);
	if (existingId) {
		db.getMetadata(existingId, res);
	} else {
		context = config.defaultContext;
		context.existingResource = null;
		res.render("edit", context);
	}
};

// Save a Resource
exports.saveResource = function(req, res, next) {
	resourceId = req.param("id", null);
	req.form.complete(function(err, fields, files) {
		if (err) { next(err); }
		else {
			metadata = JSON.parse(fields.theResource);
			db.saveMetadata(resourceId, metadata, files, res);
		}
	});
};

function _returnInvalidFormatResponse(clientResponse) {
	context = config.defaultContext;
	formatsAvailable = [];
	for (var k in output.stdFormatsAvailable) { formatsAvailable.push(k); }
	errorPage.sendErrorPage(clientResponse, 404, "You requested an invalid format. You can request one of: " + formatsAvailable);
}

// Get a formatted Resource
exports.getFormattedResource = function(req, res) {
	resourceId = req.param("id", null);
	requestedFormat = req.param("format", null);
	if (requestedFormat in output.stdFormatsAvailable) {
		db.returnFormattedRecord(resourceId, requestedFormat, res);
	} else {
		_returnInvalidFormatResponse(res);
	}
};

// Get all formatted Resources
exports.getAllRecords = function(req, res) {
	requestedFormat = req.param("format", null);
	if (requestedFormat in output.stdFormatsAvailable) {
		db.returnAllRecords(requestedFormat, res);
	} else {
		_returnInvalidFormatResponse(res);
	}
};

// Harvesting page
exports.newHarvest = function(req, res) {
	context = config.defaultContext;
	context.inputFormats = input.stdFormatsHarvestable;
	res.render("harvest", context);
};

function _validateInputFormat(input, data) {
	if (data.indexOf("<?xml version=") == 0) {
		try { inputJson = parser.toJson(data, { object: true, reversible: true }); }
		catch(err) { return [false, null, "URL returned an invalid XML document."]; }
		
		switch (input) {
		case "atom":
			if (inputJson.hasOwnProperty("feed")) {
				return [true, inputJson];
			} else { return [false, "URL did not return a valid Atom Feed."]; }
		case "iso":
			if (inputJson.hasOwnProperty("gmd:MD_Metadata")) {
				return [true, inputJson];
			} else { return [false, "URL did not return a valid ISO 19139 XML document."]; }
		}
	} else {
		return [false, "Not configured to harvest from anything but XML documents... yet."];
	}
	
}

exports.harvestResource = function(req, res) {
	urlBits = urlParser.parse(req.body.url, false, true);
	getOptions = { host: urlBits.hostname, path: urlBits.pathname + ( urlBits.search || "" ) };
	http.get(getOptions, function(proxyResponse) {
		data = "";
		proxyResponse.on("data", function(chunk) { data += chunk; });
		proxyResponse.on("end", function() {
			formatted = _validateInputFormat(req.body.harvestFormat, data);
			if (!formatted[0]) {
				errorPage.sendErrorPage(res, 200, formatted[1]);
			} else {
				db.saveHarvestedRecords(formatted[1], res, req.body.harvestFormat);
			}
		});
	}).on("error", function(err) {
		errorPage.sendErrorPage(res, 200, "The URL that you entered was invalid. Please try again.");
	});
};