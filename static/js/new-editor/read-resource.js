// Define a function that will be called iteratively
function schemaController(propertyName, propertySchema, content, htmlParent) {
	// First, resolve schema linkages
	if (propertySchema.hasOwnProperty("$ref")) { propertySchema = schemas[propertySchema["$ref"]]; }
	
	// Second, resolve schema extensions
	if (propertySchema.hasOwnProperty("extends")) {
		baseSchema = schemas[propertySchema["extends"]];
		for (property in baseSchema.properties || {}) { propertySchema.properties[property] = baseSchema.properties[property]; }
	}
	
	// Render content based on the schema for this property
	switch (propertySchema.type) {
	case "object":
		objResult = render(propertySchema.type, propertyName, propertySchema, content, htmlParent);
		if (objResult != null) {
			for (property in propertySchema.properties || {}) {
				schemaController(property, propertySchema.properties[property], content[property] || "", objResult);
			}
		}
		break;
	case "array":
		arrResult = render(propertySchema.type, propertyName, propertySchema, content, htmlParent);
		if (arrResult != null) {
			for (item in content || {}) {
				schemaController(item, propertySchema.items, content[item], arrResult);
			}
		}
		break;
	case "boolean":
		boolResult = render(propertySchema.type, propertyName, propertySchema, content, htmlParent);
		break;
	default:
		strResult = render(propertySchema.type, propertyName, propertySchema, content, htmlParent);
		break;
	}
};

function readResource(theResource, theSchema) {
	/** Loop through schema, find the related content in the document and render it to the page
	*    - Need to "mark" the resource information as read so that we can, later, incorporate extra content: NOT IMPLEMENTED
	*	 - I would also like a simple way to deal with schema elements that should be treated differently: provided through special-cases.js
	**/	
	// Render the input resource
	for (property in theSchema.properties || {}) { schemaController(property, theSchema.properties[property], theResource[property] || "", $("#theResource")); }
	
	// Cleanup Array Labels
	$("ul.array > li > fieldset > legend, ul.array > li > span").addClass("hidden");
	
	// Implement Date Pickers
	$("input.date-time").datepicker({
		dateFormat: "yy-mm-ddT00:00:00Z",
		changeMonth: true,
		changeYear: true
	});
	
	// Run any special case post-processors
	for (sc in specialCases) { if (specialCases[sc].postProcess) { specialCases[sc].postProcess(); } }
	
	// Some extra styling
	adjustInputWidths();
	collapseFieldsets();
	
};