var jade = require("jade");

/** RENDERERS FOR STRINGS **/
var defaultString = [
    "li(id=id, class=classes)",
    "\t" + "span.label= label",
    "\t" + "input(class=format, value=value)",
    "\t" + "- if (!required) {",
    "\t" + "div(id=id + '-remove').remove-button",
    "\t" + "- }"
], defaultStringRenderer = jade.compile(defaultString.join("\n"));

var textAreaString = [
	"li(id=id, class=classes)",
	"\t" + "span.label= label",
	"\t" + "textarea.content= value",
	"\t" + "- if (!required) {",
    "\t" + "span(id=id + '-remove').remove-button",
    "\t" + "- }"
], textAreaStringRenderer = jade.compile(textAreaString.join("\n"));

function enumStringRenderer(enumeration, value) {
	var enumString = [
        "li(id=id, class=classes + ' enum')",
        "\t" + "span.label= label",
        "\t" + "select(value=value)"
    ];
	for (e in enumeration) { 
		if (enumeration[e].toUpperCase() == value.toUpperCase()) {
			enumString.push("\t\toption(value='" + enumeration[e] + "', selected='selected') " + enumeration[e]); 
		} else {
			enumString.push("\t\toption(value='" + enumeration[e] + "') " + enumeration[e]); 
		}		
	}
	enumString.concat([
        "\t" + "- if (!required) {",
        "\t" + "span(id=id + '-remove').remove-button",
        "\t" + "- }"
	]);
	return jade.compile(enumString.join("\n"));
}

/** RENDERER FOR ARRAYS **/
var arrayString = [
    "li(class=classes)",
    "\t" + "fieldset",
    "\t\t" + "legend",
    "\t\t\t" + "span= label",
    "\t\t\t" + "div.add-button",
    "\t\t" + "ul(id=id, class='array')" 
], defaultArrayRenderer = jade.compile(arrayString.join("\n"));

/** RENDERER FOR OBJECTS **/
var objectString = [
    "li(class=classes)",
    "\t" + "fieldset",
    "\t\t" + "legend",
    "\t\t\t" + "span= label",
    "\t\t" + "ul(id=id, class='object')" 
], defaultObjectRenderer = jade.compile(objectString.join("\n"));

/** RENDERER FOR BOOLEAN **/
var booleanString = [
    "li(id=id, class=classes)",
    "\t" + "span.label= label",
    "\t" + "input(type='checkbox')"
], defaultBooleanRenderer = jade.compile(booleanString.join("\n"));

/** FUNCTION TO PERFORM RENDERING WITHIN THE PAGE **/
function render(type, propertyName, propertySchema, content, htmlParent) {
	context = {
		id: htmlParent.attr("id") + "-" + propertyName,
		label: propertyName,
		classes: propertySchema.hasOwnProperty("required") && propertySchema.required ? "required" : "",
	};
	switch (type) {
	case "object":
		context.classes = [context.classes, "object-container"].join(" ");
		renderer = defaultObjectRenderer;
		returnChild = "ul";
		break;
	case "array":
		context.classes = [context.classes, "array-container"].join(" ");
		renderer = defaultArrayRenderer;
		returnChild = "ul";
		break;
	case "boolean":
		renderer = defaultBooleanRenderer;
		break;
	default:
		context["value"] = content;
		context["format"] = propertySchema.hasOwnProperty("format") ? propertySchema.format : "";
		context["required"] = propertySchema.required || false;
		context.classes = [context.classes, "key-value"].join(" ");
		
		if (propertySchema.hasOwnProperty("minLength") && propertySchema.minLength > 25) { 
			context.classes = [context.classes, "textarea-container"].join(" ");
			renderer = textAreaStringRenderer; 
		}
		else if (propertySchema.hasOwnProperty("enum")) { 
			if (propertySchema.enum.indexOf("") != 0) { propertySchema.enum.unshift(""); }
			renderer = enumStringRenderer(propertySchema.enum, content); }
		else { renderer = defaultStringRenderer; }
		break;
	}
	
	// Handle special cases
	if (specialCases.hasOwnProperty(propertyName) && specialCases[propertyName].adjustContext) { specialCases[propertyName].adjustContext(context); }
	if (specialCases.hasOwnProperty(propertyName) && specialCases[propertyName].altRenderer) { 
		specialCases[propertyName].altRenderer(type, propertyName, propertySchema, content, htmlParent, context); 
		if (specialCases[propertyName].breakAfterAltRender) { return null; }
	}
	
	// Create the HTML markup
	html = renderer(context);
	
	// Append the HTML markup
	if (typeof(returnChild) != "undefined") { return $(html).appendTo(htmlParent).find(returnChild); }
	else { return $(html).appendTo(htmlParent); }
}