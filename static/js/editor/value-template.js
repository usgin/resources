var jade = require("jade");

var valueList = [];
valueList.push("li");
valueList.push("\t" + "div(ele='attribute', contenteditable='true')=propertyName");
valueList.push("\t" + "div(ele='value', contenteditable='true')=value");
var valueStr = valueList.join("\n");

var valueFn = jade.compile(valueStr);

function valueAsHtml(value, property, parentId) {
	valueContext = {
		value: value,
		propertyName: property,
	};
	
	return valueFn(valueContext);
}