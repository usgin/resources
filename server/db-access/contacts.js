var cradle = require("cradle"),
	config = require("../configuration/config.js"),
	utils = require("../configuration/utils.js"),
	exports = module.exports;

var contacts = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbContactsName);

/** MIDDLEWARE FOR GETTING A LIST OF CONTACT NAMES **/
exports.getContactNames = function(req, res, next) {
	contacts.all(function(err, recordResponse) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving contacts from the database.", status: 500 }); }
		else {
			ids = [];
			for (var r in recordResponse.rows) { if (recordResponse.rows[r].id.indexOf("_") != 0) { ids.push(recordResponse.rows[r].id); } }
			contacts.view("search/name", { keys: ids }, function(err, nameResponse) {
				if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving view of contacts from the database.", status: 500 }); }
				else { 
					req.contactNames = nameResponse.rows;
					next();
				}
			});
		}
	});
};

/** MIDDLEWARE FOR GETTING THE DETAILS OF A SINGLE CONTACT **/
exports.getContact = function(req, res, next) {
	id = req.param("id", null);
	contacts.get(id, function(err, record) {
		if (err) { utils.renderToResponse(req, res, "errorResponse", { message: "Error retrieving contact from the database.", status: 500 }); }
		else { 
			req.contact = record;
			next();
		}
	});
};

/** MIDDLEWARE FOR SAVING A NEW CONTACT **/
exports.saveNewContact = function(req, res, next) {
	contactObj = req.body;
	
	// Validity checks
	valid = true, message = "";
	if (!contactObj.hasOwnProperty("Name")) { valid = false; message += "Name is missing.\n"; }
	if (!contactObj.hasOwnProperty("ContactInformation")) {
		message += "ContactInformation is missing.\n"; 
		req.saveResponse = { error: message, success: false };
		next();
	}
	if (!contactObj.ContactInformation.hasOwnProperty("Phone")) { valid = false; message += "Phone is missing.\n"; }
	if (!contactObj.ContactInformation.hasOwnProperty("email")) { valid = false; message += "email is missing.\n"; }
	if (!contactObj.ContactInformation.hasOwnProperty("Address")) {
		message += "Address is missing.\n"; 
		req.saveResponse = { error: message, success: false };
		next();
	}
	if (!contactObj.ContactInformation.Address.hasOwnProperty("Street")) { valid = false; message += "Street is missing.\n"; }
	if (!contactObj.ContactInformation.Address.hasOwnProperty("City")) { valid = false; message += "City is missing.\n"; }
	if (!contactObj.ContactInformation.Address.hasOwnProperty("State")) { valid = false; message += "State is missing.\n"; }
	if (!contactObj.ContactInformation.Address.hasOwnProperty("Zip")) { valid = false; message += "Zip is missing."; }
	
	if (!valid) { 
		req.saveResponse = { error: message, success: false };
		next();
	}
	else { 
		contacts.save(contactObj, function(err, dbResponse) {
			if (err) { 
				utils.renderToResponse(req, res, "errorResponse", { message: "Error saving new contact", status: 500 });
			}
			else {
				req.saveResponse = { success: true };
				next(); 
			}
		}); 
	}
};