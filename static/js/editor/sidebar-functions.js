contactCounter = 0;

function addAuthor() {
	writeToArray(contactObj, "Authors");
}

function addDistributor() {
	writeToArray(contactObj, "Distributors");
}

function addLink(linkType) {
	if (linkType == "file") { writeToArray(fileLinkObj, "Links"); }
	else { writeToArray(serviceLinkObj, "Links"); }
}

function addGeographicExtent() {
	if ($("#GeographicExtent").length == 0) {
		typeChooser({ GeographicExtent: metadataObj.GeographicExtent }, "theResource");
	}
}

function addFile() {
	
}

function addContact() {
	$("#add-contact-dialog").dialog("open");
}

function addCollection() {
	$("#add-collection-dialog").dialog("open");
}

function locateTypedList(listType) {
	$(".object-header").each(function() {
		header = $(this);
		header.children().each(function() {
			if ($(this).html() == listType) {
				header[0].id = listType + "-container";			
			}
		});
	});
}

function writeToArray(doc, listType) {
	nextInArray = $("#" + listType).children().length;
	newContact = {}; newContact[nextInArray] = doc;
	typeChooser(newContact, listType);
	contactCounter++;
}

function appendContact(id, contactType) {
	locateTypedList(contactType);
	$.get("/contact/" + id, function(response) {
		writeToArray(response, contactType);
	});
}

function setupContactDialog() {
	$("#add-contact-dialog").dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 500,
		buttons: {
			"Add as Author": function() {
				appendContact($("#new-selected-contact").val(), "Authors");
				$(this).dialog("close");
			},
			"Add as Distributor": function() {
				appendContact($("#new-selected-contact").val(), "Distributors");
				$(this).dialog("close");
			},
			Cancel: function() {
				$(this).dialog("close");
			}
		}
	});
	
	refreshContactOptions();
}

function refreshContactOptions() {
	$.get("/contacts-by-name/", function(response) {
		contacts = [];
		for (var r in response) { contacts.push({ id: response[r].id, value: response[r].value.name }); }
		$("#new-contact-selector").autocomplete({
			source: contacts,
			select: function(event, ui) {				
				$("#new-selected-contact").val(ui.item.id);
				$(this).val(ui.item.value);
				return false;
			}			
		});
	});	
}

function setupCollectionDialog() {
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
				collectionsList.push(id);
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
}