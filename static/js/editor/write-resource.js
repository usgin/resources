function writeResource(topLevelHtml) {
	// Iterative function that writes content to the output resource by reading the HTML DOM
	function domController(element, rootId) {
		remover = new RegExp("^" + rootId + "-");
		if (element.children("fieldset").length > 0) {
			/** DOM elements with fieldsets are objects or arrays **/
			// Get the sub UL element
			element = element.children("fieldset").children("ul");
			
			// Read the path from the UL's id
			path = element.attr("id").replace(remover, "").replace(/-/g, ".");
			
			// Write the appropriate object to the outputResource
			if (element.hasClass("array")) { outputResource.setProperty(path, []); }
			else if (element.hasClass("object")) { outputResource.setProperty(path, {}); }
			
			// Iterate through this element's children
			element.children().each(function(index, ele) { domController($(this), rootId); });
		} else {
			/** DOM elements without fieldsets are property/value pairs **/
			// Read the path from the UL's id
			path = element.attr("id").replace(remover, "").replace(/-/g, ".");
			
			// Get the property's value
			if (element.children("input[type=checkbox]").length > 0) { value = element.children("input[type=checkbox]").is(":checked"); }
			else { value = element.children("input, textarea, select").val(); }
			
			// Write the property/value pair to the outputResource
			outputResource.setProperty(path, value);
		}
	}
	
	// Setup the outputResource with the spiffy setProperty function
	outputResource = {
		setProperty: function(propName, value) {
			obj = this;
			propParts = propName.split(".");
			for (var i = 0; i < propParts.length; i++) {
				thisProp = propParts[i];
				if (obj.hasOwnProperty(thisProp)) {
					obj = obj[thisProp];
				} else {
					if (i == propParts.length - 1) { obj[thisProp] = value; } 
					else {
						obj[thisProp] = {};
						obj = obj[thisProp];
					}
				}
			}
		}
	};
	
	// Iterate through theResource's children
	if (typeof(topLevelHtml) == "undefined") { topLevelHtml = $("#theResource"); }
	topLevelHtml.children().each(function(index, ele) {
		domController($(this), $(this).parent().attr("id"));
	});
	
	// Remove the spiffy setProperty function
	delete(outputResource.setProperty);
	
	// Write the outputResource to the form before it gets submitted
	$("#the-new-resource").val(JSON.stringify(outputResource));
	return outputResource;
}

