var jade = require("jade");

var controlList = [];

controlList.push("ul.control-tools");
controlList.push("\t" + "li.minimize-button(onclick=minimizeFunction)");
controlList.push("\t" + "li.delete-button(onclick=deleteFunction)");

var controlStr = controlList.join("\n");
var controlFn = jade.compile(controlStr);

function controlToolbar(id, canDelete, canMinimize) {
	context = {
		canDelete: canDelete,
		id: id,
		minimizeFunction: "minimize('#" + id + "')",
		deleteFunction: "deleteObj('#" + id + "')"
	};
	return controlFn(context);
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