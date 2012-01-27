$(document).ready(function() {
	var published = startObj.Published || false;
	$("#publish-resource-checkbox").prop("checked", published);
	
	typeChooser(startObj, "theResource");
	
	// A couple of adjustments:
	//	First, make the text of attributes of titles in arrays un-editable	
	$("ul[eletype='array'] > li > div > div[ele='attribute']").removeAttr("contenteditable");
	//	Then, move the site information block below the other blocks
	$("#site-info-block").insertAfter("#map-block");
	
	// Fill in collection information
	if (collectionsList.length > 0) {
		$.post("/collection-names", { ids: collectionsList }, function(response) {
			for (r in response) {
				$("#collections-current-list").prepend("<li><a href='/collection/" + response[r].id + "'>" + response[r].value.title + "</a></li>");
			}
		});
	} else {
		$("#collections-current-list").prepend("<li id='nil-collection' class='nil-collection'>Not published in any collection</li>");
	}
	
	// Setup the dialog box for selecting a contact
	setupContactDialog(); // defined in sidebar-functions.js
	
	// Setup the dialog box for selecting a collection
	setupCollectionDialog(); // defined in sidebar-functions.js
	
	// Setup the response for saving a new contact
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
	
	// Add properties that are not directly connected to the form
	theResource["Published"] = $("#publish-resource-checkbox").prop("checked");
	theResource["Collections"] = collectionsList;
	if (harvestInfo) {
		theResource["HarvestInformation"] = harvestInfo;
	}
	$("#the-new-resource").val(JSON.stringify(theResource));
}

function showValidation(id) {
	$("#validation-dialog").dialog({
		autoOpen: false,
		modal: true,
		resizable: true,
		width: 850,
		buttons: {			
			"OK": function() {
				$(this).dialog("close");
			}
		}
	});
	
	$.get("/manage/" + id + "/summary", function(response) {
		$("#validation-dialog").empty();
		$("#validation-dialog").append(response);
		$("#validation-dialog").dialog("open");
	});
}