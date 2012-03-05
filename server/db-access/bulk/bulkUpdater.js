var cradle = require("cradle"),
	http = require("http"),
	config = require("../../configuration/config.js"),
	utils = require("../../configuration/utils.js");

var repository = new(cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort, { cache: false }).database(config.dbInfo.databases.dbRepoName);

function BulkUpdater(propertyToUpdate, updateMethod, updateValue, recordCollection, searchCriteria) {	
	var that = this;
	
	if (propertyToUpdate && propertyToUpdate != "") { this.propertyToUpdate = propertyToUpdate; }
	else { console.log("A propertyToUpdate must be given"); return null; }
	
	var validMethods = ["add", "append", "remove", "replace"];
	if (validMethods.indexOf(updateMethod) != -1) { this.updateMethod = updateMethod; } 
	else { console.log("An updateMethod must be specified, and be one of " + validMethods.join(",")); return null; }
	
	if (updateValue && (updateValue != "" || this.updateMethod == "remove")) { this.updateValue = updateValue; } 
	else if (this.updateMethod == "remove") { this.updateValue = null; } 
	else { console.log("No updateValue was specified, and the updateMethod is not 'remove'."); return null; }
	
	// collectionIsReady indicates that the recordCollection has been populated
	this.collectionIsReady = false;
	
	// If a valid recordCollection was passed in, use that
	if (recordCollection && recordCollection instanceof Array) { 
		this.recordCollection = recordCollection; 
		this.collectionIsReady = true;
	}
	
	// Otherwise, use the searchCriteria to perform a lucene search
	else if (searchCriteria) {
		var searchObj = { index: "full", terms: searchCriteria };
		var queryParams = "?include_docs=true&limit=999999&";
		var searchOptions = {
			host: config.dbInfo.dbHost,
			port:
				config.dbInfo.dbPort,
			path: utils.searchUrl + searchObj.index + queryParams + "q=" + searchObj.terms
		};
		
		http.get(searchOptions, function(searchResponse) {
			var searchData = "";
			searchResponse.on("data", function(chunk) { searchData += chunk; });
			searchResponse.on("end", function() {
				that.recordCollection = []; searchedRows = JSON.parse(searchData).rows;
				for (r in searchedRows) { that.recordCollection.push(searchedRows[r].doc); }
				that.collectionIsReady = true;
			});
		}).on("error", function(err) { console.log(err); return null; });
	} 
	
	// Fail.
	else { console.log("No recordCollection was given, nor was a valid searchCriteria specified"); return null; }
};

BulkUpdater.prototype.update = function update() {
	var self = this;
	function runTheUpdate() {
		// oh we'll need this!
		function objGet(obj, propName, defVal) {
			propParts = propName.split(".");
			if (!obj || propParts.length == 0) { return defVal; }
			for (var i = 0; i < propParts.length; i++) {
				thisProp = propParts[i];
				if (obj.hasOwnProperty(thisProp)) {
					obj = obj[thisProp];
					if (i == propParts.length -1) { return obj; }
				} else {
					return defVal;
				}
			}
		}
		
		for (var i = 0; i < self.recordCollection.length; i++) {
			// Get the doc, give it the snazzy setProperty function
			var doc = self.recordCollection[i];
			doc.setProperty = function(propName, value) {
				obj = this;
				propParts = propName.split(".");
				for (var i = 0; i < propParts.length; i++) {
					thisProp = propParts[i];
					if (i == propParts.length - 1) { obj[thisProp] = value; }
					else if (obj.hasOwnProperty(thisProp)) { obj = obj[thisProp]; }
					else {
						obj[thisProp] = {};
						obj = obj[thisProp];
					}
				}
			};
			
			// Get the current value of the property that is to be changed.
			var currentValue = objGet(doc, self.propertyToUpdate, null);
			
			// Adjust the doc
			switch (self.updateMethod) {
				case "add":
					if (currentValue != null) { console.log("You told me to add the property " + self.propertyToUpdate + " to a document that already has it: " + doc._id); }
					else { doc.setProperty(self.propertyToUpdate, self.updateValue); }
					break;
				case "append":
					if (!currentValue instanceof Array) { console.log("You told me to append a value to the property " + self.propertyToUpdate + ", which is not an array here: " + doc._id); }
					else { 
						currentValue.push(self.updateValue); 
						doc.setProperty(self.propertyToUpdate, currentValue);
					}
					break;
				case "remove":
					if (currentValue == null) { console.log("You told me to remove the property " + self.propertyToUpdate + " from a document that doesn't have it: " + doc._id); }
					else { 
						// TODO: Implement!! 
					}
					break;
				case "replace":
					if (currentValue == null) { console.log("You told me to replace the property " + self.propertyToUpdate + " in a document that doesn't have that it: " + doc._id); }
					else { doc.setProperty(self.propertyToUpdate, self.updateValue); }
					break;
			}
			
			// Save the doc			
			repository.save(doc._id, doc, function(err, saveResponse) {
				if (err) { console.log("There was an error saving a file to the database: " + err); }
				else { console.log("Updated: " + JSON.stringify(saveResponse)); }
			});
		}
	}
	
	// Wait a couple of seconds if the collection isn't ready yet
	if (self.collectionIsReady) { runTheUpdate(); }
	else { setTimeout(function() { if (self.collectionIsReady) { runTheUpdate(); } }, 2000); }
};

module.exports = BulkUpdater;