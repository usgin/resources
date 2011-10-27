var jade = require("jade");

var objList = [];
objList.push("li");
objList.push("\t" + "div(ele='attribute', eletype=eleType, contenteditable='true')=propertyName");
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