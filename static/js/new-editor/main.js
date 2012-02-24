$(document).ready(function() {
	// Move the site information block below the other blocks
	$("#site-info-block").insertAfter("#map-block");
	
	// Read the resource in order to generate the user interface
	readResource(startingResource, schemas["http://resources.usgin.org/uri-gin/usgin/schema/json-metadata/"]);
});