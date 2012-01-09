var jade = require("jade");

var controlList = [];

controlList.push("ul.control-tools");
controlList.push("\t" + "- if (canAddToContacts) {");
controlList.push("\t" + "li.register-contact-button.tb-button(onclick=contactFunction)");
controlList.push("\t" + "- }");
controlList.push("\t"+ "li.add-obj-button.tb-button(onclick=addObjFunction)");
controlList.push("\t"+ "li.add-arr-button.tb-button(onclick=addArrFunction)");
controlList.push("\t"+ "li.add-val-button.tb-button(onclick=addValFunction)");
controlList.push("\t" + "- if (canMinimize) {");
controlList.push("\t" + "li.minimize-button.tb-button(onclick=minimizeFunction)");
controlList.push("\t" + "- }");
controlList.push("\t" + "- if (canDelete) {");
controlList.push("\t" + "li.delete-button.tb-button(onclick=deleteFunction)");
controlList.push("\t" + "- }");

var controlStr = controlList.join("\n");
var controlFn = jade.compile(controlStr);

function controlToolbar(id, canDelete, canMinimize, canAddToContacts) {
	context = {
		canDelete: canDelete,
		canMinimize: canMinimize,
		canAddToContacts: canAddToContacts,
		id: id,
		addObjFunction: "addNewObject('" + id + "')",
		addArrFunction: "addNewArray('" + id + "')",
		addValFunction: "addNewValue('" + id + "')",
		minimizeFunction: "minimize('#" + id + "')",
		deleteFunction: "deleteObj('#" + id + "')",
		contactFunction: "registerContact('" + id + "')"
	};
	return controlFn(context);
}

function addNewObject(parentId) {
	thisId = getId();
	addHtml(objAsHtml("NewProperty", "object", thisId), parentId, true);
	addContactButton = parentId == "Authors" || parentId == "Distributors";
	addHtml(controlToolbar(thisId, true, true, addContactButton), thisId + "-header", true);
}

function addNewArray(parentId) {
	thisId = getId();
	addHtml(objAsHtml("NewProperty", "array", thisId), parentId, true);
	addHtml(controlToolbar(thisId, true, true), thisId + "-header", true);
}

function addNewValue(parentId) {
	addHtml(valueAsHtml("Add a new value", "NewProperty"), parentId, true);
}

function minimize(id) {
	listToCollapse = $(id);
	collapseButton = $(id + "-header > ul > li.minimize-button");
	
	if (collapseButton.hasClass("collapsed")) {
		collapseButton.removeClass("collapsed");
		listToCollapse.removeClass("collapsed");
	} else {
		collapseButton.addClass("collapsed");
		listToCollapse.addClass("collapsed");
	}
}

function deleteObj(id) {
	$(id + "-container").remove();
}

function deleteVal(id) {
	$(id).remove();
}

function registerContact(id) {
	theContact = {};
	$("#" + id).children().each(function(index, ele) {
		domChooser($(this), theContact);
	});
	
	$.post("/new-contact/", theContact, function(response) {
		$("#contact-message-container").empty();
		if (!response.success) {
			$("#contact-message-container").addClass("ui-state-error");
			$("#contact-message-container").append("<span class='ui-icon ui-icon-alert' style='float: left; margin-right: .3em;'></span>");
			$("#contact-message-container").append("<strong>Error:</strong>");
			$("#contact-message-container").append("<p> " + response.error + "</p>");
		} else {
			$("#contact-message-container").addClass("ui-state-highlight");
			$("#contact-message-container").append('<span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>');
			$("#contact-message-container").append("<strong>Success:</strong>");
			$("#contact-message-container").append("<p> Your contact has been registered successfully!</p>");
			refreshContactOptions();
		}
		
		$("#saved-contact-dialog").dialog("open");
	});
}