var jade = require("jade");

/**
 * DEFINE SPECIAL CASES HERE:
 * 	- Special cases are recognized by property name only - be careful where names are repeated!!
 * 	- Special cases can make adjustments to context passed to a jade renderer
 * 	- Special cases can completely replace a jade renderer, providing some other mechanism for rendering the content
 *  - Special cases can kill the flow of the default render function, or allow it to continue
 *  - Special cases can define a post-processing function that might make some adjustments after the page has rendered
 *  - Make sure to define functions for the adjustments that you want to make!!
 **/
var specialCases = {
	"HarvestInformation": { adjustContext: hideElement, altRenderer: false, postProcess: false, breakAfterAltRender: false },
	"Collections": { adjustContext: hideElement, altRenderer: collectionRenderer, postProcess: false, breakAfterAltRender: false },
	"Distributor": { adjustContext: distributorContext, altRenderer: false, postProcess: distributorPostProcessor, breakAfterAltRender: false },
	"Links": { adjustContext: false, altRenderer: linkRenderer, postProcess: false, breakAfterAltRender: true }
};

function hideElement(context) {
	context.classes = [context.classes, "hidden"].join(" ");
}

function collectionRenderer(type, propertyName, propertySchema, content, htmlParent) {
	// Fill in the sidebar block
	if (content.length > 0) {
		$.post("/collection-names", { ids: content }, function(response) {
			for (r in response) {
				$("#collections-current-list").prepend("<li><a href='/collection/" + response[r].id + "'>" + response[r].value.title + "</a></li>");
			}
		});
	}
}

function distributorContext(context) {
	context.classes = [context.classes, "distributor-names"].join(" ");
}

function distributorPostProcessor() {
	names = [];
	// Complicated selector is for Distributor names -- collect the names into an array
	$("#theResource-Distributors span:contains('Name') + input").each(function(index, ele) {
		if ($(this).val() != "") { names.push($(this).val()); }
	});
	
	// Implement change event on Distributor names to adjust autocomplete sources
	$("#theResource-Distributors span:contains('Name') + input").change(function() { distributorPostProcessor(); });
	
	// Implement autocomplete on link distributors
	$(".distributor-names input").autocomplete({ source: names });
}

function linkRenderer(type, propertyName, propertySchema, content, htmlParent, currentContext) {
	// Create the HTML markup
	html = renderer(currentContext);
	
	// Append the HTML markup
	linkContainer = $(html).appendTo(htmlParent).find("ul");
	
	// Loop through the link objects
	for (item in content || {}) {
		if (content[item].hasOwnProperty("ServiceType")) {
			linkSchema = schemas["http://resources.usgin.org/uri-gin/usgin/schema/json-service-link/"];
		} else {
			linkSchema = schemas["http://resources.usgin.org/uri-gin/usgin/schema/json-link/"];
		}
		
		schemaController(item, linkSchema, content[item], linkContainer);
	}
}