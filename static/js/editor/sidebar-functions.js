contactCounter = 0;

function addAuthor() {
	locateContactList("Authors");
	writeTheDamnContact(contactObj, "Authors");
}

function addDistributor() {
	locateContactList("Distributors");
	writeTheDamnContact(contactObj, "Distributors");
}

function addLink() {
	
}

function addFile() {
	
}

function addContact() {
	$("#add-contact-dialog").dialog("open");
}

function locateContactList(contactType) {
	$(".object-header").each(function() {
		header = $(this);
		header.children().each(function() {
			if ($(this).html() == contactType) {
				header[0].id = contactType + "-container";
				$("#" + contactType + "-container + ul")[0].id = contactType + "-list";				
			}
		});
	});
}

function writeTheDamnContact(doc, contactType) {
	nextInArray = $("#" + contactType + "-list").children().length;
	newContact = {}; newContact[nextInArray] = doc;
	typeChooser(newContact, contactType + "-list");
	contactCounter++;
}

function appendContact(id, contactType) {
	locateContactList(contactType);
	$.get("/contact/" + id, function(response) {
		writeTheDamnContact(response, contactType);
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