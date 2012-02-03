var exports = module.exports,
	config = require("./config.js");
	schema = require("./schemas.js");

/** SEARCH INFORMATION **/
exports.searchUrl = config.dbInfo.dbVersion >= 1.1 ? "/_fti/local/" + config.dbInfo.databases.dbRepoName + "/_design/indexes/" : "/" + config.dbInfo.databases.dbRepoName + "/_fti/_design/indexes/";
exports.collectionSearchUrl = config.dbInfo.dbVersion >= 1.1 ? "/_fti/local/" + config.dbInfo.databases.dbCollectionName + "/_design/indexes/" : "/" + config.dbInfo.databases.dbCollectionName + "/_fti/_design/indexes/";

/** METADATA TEMPLATE GENERATION AND ANALYSIS **/
// Export a key/value hash of { schema URI : schema object from schemas.js }
var schemas = {};
for (var s in schema) { schemas[schema[s].id] = schema[s]; }
exports.schemas = schemas;

// Create a generic instance of a given schema 
function generateGenericInstance(schemaId) {
	// First define an iterative function that will generate an instance of an arbitrary schema object
	function objectGenerator(schemaObject) {
		// If the object is by reference, resolve the reference
		schemaObject = schemaObject.hasOwnProperty("$ref") ? schemas[schemaObject["$ref"]] : schemaObject;
		
		// Setup properties and output variables
		var properties = schemaObject.properties || {},
			outputObj = {};
		
		// If the object extends another object, grab the base-type's properties
		if (schemaObject.hasOwnProperty("extends")) {
			baseProperties = schemas[schemaObject["extends"]].properties || {};
			for (var baseProp in baseProperties) { properties[baseProp] = baseProperties[baseProp]; }
		}
		
		// Should really handle any type with a switch, for now just escape the string case...
		if (schemaObject.type == "string") { return "Please insert a value of type: 'string'."; }
		
		// Loop through properties, handle each according to its type
		for (var propName in properties || {}) {
			var thisType = properties[propName].type ? properties[propName].type : "any";
			switch (thisType) {
				case "object":
					outputObj[propName] = objectGenerator(properties[propName]);
					break;
				case "array":
					outputObj[propName] = [];
					for (var i = 0; i < (properties[propName].minItems || 1); i++) {
						outputObj[propName].push(objectGenerator(properties[propName].items));
					}
					break;
				case "boolean":
					outputObj[propName] = false;
					break;
				case "null":
					outputObj[propName] = null;
					break;
				default:
					if (properties[propName].enum) { outputStr = properties[propName].enum[0]; } 
					else {
						outputStr = "Please insert a value of type: '" + thisType + "'";
						outputStr += properties[propName].format ? " according to the format: '" + properties[propName].format + "'." : ".";
					}
					outputObj[propName] = outputStr;
					break;
			}
		}
		
		// Return the object
		return outputObj;
	}
	
	// Now, use that function to generate the instance of the specified schema
	if (schemaId in schemas) { return objectGenerator(schemas[schemaId]); } 
	else { return null; }
};

// Generate examples for each of the defined schemas
var examples = {};
for (var s in schema) { examples[schema[s].id] = generateGenericInstance(schema[s].id); }
exports.examples = examples;

/** VIEW-RENDERING AND CONTEXT GENERATION **/
exports.renderToResponse = function(request, response, viewName, extra) {
	// Start with the basic context required for all pages
	context = {
		mainLogo: config.serverInfo.serverLogoLocation,
		mainTitle: config.serverInfo.serverTitle,
		mainSubTitle: config.serverInfo.serverSubTitle,
		orgName: config.organizationInfo.orgName,
		orgUrl: config.organizationInfo.orgUrl,
		orgYear: config.organizationInfo.orgYear,
		helpEmail: config.organizationInfo.orgEmail,
		gaNumber: config.serverInfo.googleAnalyticsAccountNumber
	};
	
	// Check if the request is authenticated
	context.authenticated = request ? request.isAuthenticated() : false;
	
	// Add additional context
	extraContext = extra || {};
	for (key in extraContext) {
		context[key] = extraContext[key];
	}
	
	// Render the view
	response.render(viewName, context);
};

/** HELPER FUNCTIONS **/
exports.getCurrentDate = function() {
	function ISODateString(d){
		 function pad(n){return n<10 ? '0'+n : n;}
		 return d.getUTCFullYear()+'-'
		      + pad(d.getUTCMonth()+1)+'-'
		      + pad(d.getUTCDate())+'T'
		      + pad(d.getUTCHours())+':'
		      + pad(d.getUTCMinutes())+':'
		      + pad(d.getUTCSeconds())+'Z';}
	
	now = new Date();
	return ISODateString(now);
};

