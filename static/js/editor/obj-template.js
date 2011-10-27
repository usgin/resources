var jade = require("jade");

var objList = [];
objList.push("li(id=listId + '-container')");
objList.push("\t" + "div.object-header.clear-block(id=listId + '-header')");
objList.push("\t\t" + "div(ele='attribute', eletype=eleType, contenteditable='true')=propertyName");
objList.push("\t" + "ul(id=listId, eletype=eleType)");
var objStr = objList.join("\n");

var objFn = jade.compile(objStr);

function objAsHtml(property, type, thisId) {
	objContext = {
		listId: thisId,	
		propertyName: property,
		eleType: type
	};
	
	return objFn(objContext);
}