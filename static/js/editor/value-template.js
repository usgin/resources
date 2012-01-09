valueIdClock = 0;
function getValueId() {
	valueIdClock++;
	return "value-" + valueIdClock;
}

var jade = require("jade");

var valueList = [];
valueList.push("li(id=id)");
valueList.push("\t" + ".value-container.clear-block");
valueList.push("\t\t" + "ul.control-tools");
valueList.push("\t\t\t" + "li.delete-button.tb-button(onclick=deleteFunction)");
valueList.push("\t\t" + "div(ele='attribute', eletype='value', contenteditable='true')=propertyName");
valueList.push("\t\t" + "div(ele='value', contenteditable='true')=value");
var valueStr = valueList.join("\n");

var valueFn = jade.compile(valueStr);

function valueAsHtml(value, property) {
	thisId = getValueId();
	valueContext = {
		id: thisId,	
		value: value,
		propertyName: property,
		deleteFunction: "deleteVal('#" + thisId + "')",
	};
	
	return valueFn(valueContext);
}