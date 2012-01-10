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
exports.saveResource = function(req, res) {
	resourceId = req.param("id", null);
	metadata = JSON.parse(req.body.theResource);
	db.saveMetadata(resourceId, metadata, null, res); 
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
}

exports.harvestResource = function(req, res) {
	// TODO: Better handling of empty/incorrect parameters on harvesting form
	if (!req.body.harvestFormat) {
		res.redirect("/new-harvest/");
		return;
	}
	urlBits = urlParser.parse(req.body.url, false, true);
	getOptions = { host: urlBits.hostname, port: (urlBits.port || 80), path: urlBits.pathname + ( urlBits.search || "" ) };
	http.get(getOptions, function(proxyResponse) {
		data = "";
		proxyResponse.on("data", function(chunk) { data += chunk; });
		proxyResponse.on("end", function() {
			formatted = _validateInputFormat(req.body.harvestFormat, data);
			if (!formatted[0]) {
				errorPage.sendErrorPage(res, 200, formatted[1]);
			} else {
				db.saveHarvestedRecords(formatted[1], res, req.body.harvestFormat, req.body.url);
			}
		});
	}).on("error", function(err) {
		errorPage.sendErrorPage(res, 200, "The URL that you entered was invalid. Please try again.");
	});
};

// Search Page
exports.searchPage = function(req, res) {
	context = config.defaultContext;
	context.searchUrl = config.searchInfo.searchUrl;
	res.render("search", context);
};

// Perform a search
exports.doSearch = function(req, res) {
	searchObj = req.body;
	if (searchObj.hasOwnProperty("full")) {
		searchOptions = {
			host: config.dbInfo.dbHost,
			port: config.dbInfo.dbPort,
			path: config.searchInfo.searchUrl + "full?q=" + searchObj.full
		};
		
		http.get(searchOptions, function(searchResponse) {
			searchData = "";
			searchResponse.on("data", function(chunk) { searchData += chunk; });
			searchResponse.on("end", function() {
				searchResults = JSON.parse(searchData);
				ids = [];
				for (var r in searchResults.rows) {
					ids.push(searchResults.rows[r].id);
				}
				db.getMultipleRecords(ids, res);
			});
		}).on("error", function(err) {
			errorPage.sendErrorPage(clientResponse, 500, "Error" + err.reason);
		});
	}
};

exports.getContacts = function(req, res) {
	db.getContacts(res);
};

exports.getContactById = function(req, res) {
	id = req.param("id", false);
	if (!id) { res.send({ error: "A valid contact ID was not provided" }, { "Content-Type": "application/json" }, 400); }
	else { db.getContactInfo(id, res); }
};

exports.newContact = function(req, res) {
	contactObj = req.body;
	
	// Validity checks
	valid = true, message = "";
	if (!contactObj.hasOwnProperty("Name")) { valid = false; message += "Name is missing.\n"; }
	if (!contactObj.hasOwnProperty("ContactInformation")) {
		message += "ContactInformation is missing.\n"; 
		res.json({ error: message, success: false }); return;
	}
	if (!contactObj.ContactInformation.hasOwnProperty("Phone")) { valid = false; message += "Phone is missing.\n"; }
	if (!contactObj.ContactInformation.hasOwnProperty("email")) { valid = false; message += "email is missing.\n"; }
	if (!contactObj.ContactInformation.hasOwnProperty("Address")) {
		message += "Address is missing.\n"; 
		res.json({ error: message, success: false }); return;
	}
	if (!contactObj.ContactInformation.Address.hasOwnProperty("Street")) { valid = false; message += "Street is missing.\n"; }
	if (!contactObj.ContactInformation.Address.hasOwnProperty("City")) { valid = false; message += "City is missing.\n"; }
	if (!contactObj.ContactInformation.Address.hasOwnProperty("State")) { valid = false; message += "State is missing.\n"; }
	if (!contactObj.ContactInformation.Address.hasOwnProperty("Zip")) { valid = false; message += "Zip is missing."; }
	
	if (!valid) { res.json({ error: message, success: false }); }
	else { db.saveNewContact(contactObj, res); }	
};