contactCounter = 0;

function addAuthor() {
	locateContactList("Authors");
	writeToArray(contactObj, "Authors");
}

function addDistributor() {
	locateContactList("Distributors");
	writeToArray(contactObj, "Distributors");
}

function addLink(linkType) {
	locateTypedList("Links");
	if (linkType == "file") { writeToArray(fileLinkObj, "Links"); }
	else { writeToArray(serviceLinkObj, "Links"); }
}

function addFile() {
	
}

function addContact() {
	$("#add-contact-dialog").dialog("open");
}

function locateTypedList(listType) {
	$(".object-header").each(function() {
		header = $(this);
		header.children().each(function() {
			if ($(this).html() == listType) {
				header[0].id = listType + "-container";
				$("#" + listType + "-container + ul")[0].id = listType + "-list";				
			}
		});
	});
}

function writeToArray(doc, listType) {
	nextInArray = $("#" + listType + "-list").children().length;
	newContact = {}; newContact[nextInArray] = doc;
	typeChooser(newContact, listType + "-list");
	contactCounter++;
}

function appendContact(id, contactType) {
	locateContactList(contactType);
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