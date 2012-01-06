function addAuthor() {
	authorsFound = false;
	$(".object-header").each(function() {
		header = $(this);
		header.children().each(function() {
			if ($(this).html() == "Authors") {
				header[0].id = "authors-container";
				authorsFound = true;
			}
		});
	});
	if (authorsFound) {
		$("#authors-container + ul")[0].id = "authors-list";
		newAuthor = { "NewProperty": contactObj };
		typeChooser(newAuthor, "authors-list");
	}
}

function addDistributor() {
	
}

function addLink() {
	
}

function addFile() {
	
}

function addContact() {
	/**
	 * Popup dialog to select contacts from a list
	 * 	Dialog specifies if contact should be added as an author or distributor
	 */
	$("#add-contact-dialog").dialog("open");
	
	/**
	 * Add the contact to either the distributor or author section -- have to check that
	 * 	it exists first, though
	 */
}

function setupContactDialog() {
	$("#add-contact-dialog").dialog({
		autoOpen: false,
		modal: true
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