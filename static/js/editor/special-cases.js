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
	"Links": { adjustContext: false, altRenderer: linkRenderer, postProcess: linkPostProcessor, breakAfterAltRender: true },
	"Authors": { adjustContext: false, altRenderer: false, postProcess: contactPostProcessor, breakAfterAltRender: false },
	"Distributors": { adjustContext: false, altRenderer: false, postProcess: contactPostProcessor, breakAfterAltRender: false },
	"Published": { adjustContext: hideElement, altRenderer: publishedRenderer, postProcess: publishedPostProcessor, breakAfterAltRender: false }
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
	linkString = []; for (as in arrayString) { linkString.push(arrayString[as]); }
	linkString.splice(4, 1, "\t\t\tdiv.add-file-button", "\t\t\tdiv.add-service-button");
	linkRenderer = jade.compile(linkString.join("\n"));
	
	// Create the HTML markup
	html = linkRenderer(currentContext);
	
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

function linkPostProcessor() {
	$(".add-file-button").click(function() {
		addArrayContent("Links", "http://resources.usgin.org/uri-gin/usgin/schema/json-link/");
	});
	$(".add-service-button").click(function() {
		addArrayContent("Links", "http://resources.usgin.org/uri-gin/usgin/schema/json-service-link/");
	});
}

function contactPostProcessor() {
	// Add the registered contact button
	$("#theResource-Distributors, #theResource-Authors").prev("legend").each(function() {
		if ($(this).children("div.add-contact-button").length == 0) { $(this).append("<div class='add-contact-button'></div>"); }
	});
	// Add contact button functionality
	$(".add-contact-button").click(function() {
		$("#add-contact-dialog").dialog("option", "context", $(this).parent("legend").next("ul"));
		$("#add-contact-dialog").dialog("open");
	});
}

function publishedRenderer(type, propertyName, propertySchema, content, htmlParent, currentContext) {
	var pubBooleanString = [
	    "#publisher",
	    "\t" + "span.label Published?",
	    "\t" + "input(type='checkbox')"
	], pubBooleanRenderer = jade.compile(pubBooleanString.join("\n"));
	html = pubBooleanRenderer();
	$("#editor-header").prepend(html);
}

function publishedPostProcessor() {
	// Check the box if the resource is published
	$("#publisher > input, #theResource-Published > input").prop("checked", startingResource.Published || false);
	$("#publisher > input").change(function() {
		$("#theResource-Published > input").prop("checked", $(this).prop("checked"));
	});
}