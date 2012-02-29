function writeToArray(newItem, newItemSchema, htmlParent) {
	nextInArray = htmlParent.children().length;
	schemaController(nextInArray, newItemSchema, newItem, htmlParent);
	
	// Bunch of functions to insure proper button functioning. Ugly-much?
	arrayItemNames();
	adjustInputWidths();
	removeButtons();
	arrayButtons();
	distributorPostProcessor();
}

function addArrayContent(metadataProperty, itemSchemaOverride) {
	if (itemSchemaOverride) { propSchema = schemas[itemSchemaOverride]; }
	else { propSchema = schemas["http://resources.usgin.org/uri-gin/usgin/schema/json-metadata/"].properties[metadataProperty].items; }
	
	if (propSchema.hasOwnProperty("$ref")) { 
		starterContent = templates[propSchema["$ref"]];
		propSchema = schemas[propSchema["$ref"]];		
	} else {
		starterContent = instanceGenerator(propSchema);
	}
	writeToArray(starterContent, propSchema, $("#theResource-" + metadataProperty));
}

function addCollection() {
	$("#add-collection-dialog").dialog("open");
}

function showValidation(id) {	
	$.get("/manage/" + id + "/summary", function(response) {
		$("#validation-dialog").empty();
		$("#validation-dialog").append(response);
		$("#validation-dialog").dialog("open");
	});
}