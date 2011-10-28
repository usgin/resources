var jade = require("jade");

var controlList = [];

controlList.push("ul.control-tools");
controlList.push("\t"+ "li.add-obj-button(onclick=addObjFunction)");
controlList.push("\t"+ "li.add-arr-button(onclick=addArrFunction)");
controlList.push("\t"+ "li.add-val-button(onclick=addValFunction)");
controlList.push("\t" + "li.minimize-button(onclick=minimizeFunction)");
controlList.push("\t" + "li.delete-button(onclick=deleteFunction)");

var controlStr = controlList.join("\n");
var controlFn = jade.compile(controlStr);

function controlToolbar(id, canDelete, canMinimize) {
	context = {
		canDelete: canDelete,
		id: id,
		addObjFunction: "addObject('" + id + "')",
		addArrFunction: "addArray('" + id + "')",
		addValFunction: "addValue('" + id + "')",
		minimizeFunction: "minimize('#" + id + "')",
		deleteFunction: "deleteObj('#" + id + "')"
	};
	return controlFn(context);
}

function addObject(parentId) {
	thisId = getId();
	addHtml(objAsHtml("NewProperty", "object", thisId), parentId, true);
	addHtml(controlToolbar(thisId, true, true), thisId + "-header", true);
}

function addArray(parentId) {
	thisId = getId();
	addHtml(objAsHtml("NewProperty", "array", thisId), parentId, true);
	addHtml(controlToolbar(thisId, true, true), thisId + "-header", true);
}

function addValue(parentId) {
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