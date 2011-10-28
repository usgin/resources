var jade = require("jade");

var valueList = [];
valueList.push("li");
valueList.push("\t" + ".value-container.clear-block");
valueList.push("\t\t" + "div(ele='attribute', eletype='value', contenteditable='true')=propertyName");
valueList.push("\t\t" + "div(ele='value', contenteditable='true')=value");
var valueStr = valueList.join("\n");

var valueFn = jade.compile(valueStr);

function valueAsHtml(value, property) {
	valueContext = {
		value: value,
		propertyName: property,
	};
	
	return valueFn(valueContext);
}