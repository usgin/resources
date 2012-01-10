$(document).ready(function() {
	typeChooser(startObj, "theResource");
	
	// A couple of adjustments:
	//	First, make the text of attributes of titles in arrays un-editable	
	$("ul[eletype='array'] > li > div > div[ele='attribute']").removeAttr("contenteditable");
	//	Then, move the site information block below the other blocks
	$("#site-info-block").insertAfter("#map-block");
	// If the document is in no collections, indicate this
	collectionList = $("#collections-current-list");
	if (collectionList.children().length == 0) {
		collectionList.append("<li class='included-collection nil-collection'>Not published in any collection</li>");
	}
	
	setupContactDialog(); // defined in sidebar-functions.js
	$("#saved-contact-dialog").dialog({
		autoOpen: false,
		modal: true,
		resizable: false,		
		buttons: {			
			"OK": function() {
				$(this).dialog("close");
			}
		}
	});
});

function writeResource() {
	theResource = {};
	$("#theResource").children().each(function(index, ele) {
		domChooser($(this), theResource);
	});
	
	if (harvestInfo) {
		theResource["HarvestInformation"] = harvestInfo;
	}
	$("#the-new-resource").val(JSON.stringify(theResource));
}