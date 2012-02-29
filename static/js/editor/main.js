$(document).ready(function() {
	// Move the site information block below the other blocks
	$("#site-info-block").insertAfter("#map-block");
	
	// Read the resource in order to generate the user interface
	readResource(startingResource, schemas["http://resources.usgin.org/uri-gin/usgin/schema/json-metadata/"]);
	
	// Setup the contact dialog
	$("#add-contact-dialog").dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 500,
		buttons: {
			"Add Contact": function() {
				$.get("/contact/" + $("#new-selected-contact").val(), function(response) {
					writeToArray(
						response, 
						schemas["http://resources.usgin.org/uri-gin/usgin/schema/json-metadata-contact/"],
						$("#add-contact-dialog").dialog("option", "context")
					);
				});
				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
	refreshContactOptions();
	
	// Setup the collections dialog
	$("#add-collection-dialog").dialog({
		autoOpen: false,
		modal: true,
		resizeable: false,
		width: 500,
		buttons: {
			"Add to selected collection": function() {
				id = $("#new-selected-collection").val();
				title = $("#new-collection-selector").val();
				$("#collections-current-list").prepend("<li><a href='/collection/" + id + "'>" + title + "</a></li>");
				$("#nil-collection").remove();
				writeToArray(id, schemas["http://resources.usgin.org/uri-gin/usgin/schema/json-metadata/"].properties.Collections.items, $("#theResource-Collections"));
				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
	
	$.post("/collection-names", { ids: "all" }, function(response) {
		collections = [];
		for (var r in response) { collections.push({ id: response[r].id, value: response[r].value.title }); }
		$("#new-collection-selector").autocomplete({
			source: collections,
			select: function(event, ui) {
				$("#new-selected-collection").val(ui.item.id);
				$(this).val(ui.item.value);
				return false;
			}
		});
	});
	
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
	
	// Setup the validation dialog
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
	
	// Setup the deletion dialog
	$("#deletion-dialog").dialog({
		autoOpen: false,
		modal: true,
		resizable: true,
		width: 850,
		buttons: {			
			"OK": function() {
				$.get("/delete-resource/" + $(this).dialog("option", "theid"), function(response) {
					window.location = "/search/";
				});
				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
});