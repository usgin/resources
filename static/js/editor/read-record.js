idClock = 0;
function getId() {
	idClock++;
	return "attribute-list-" + idClock;
}

function parentIdCleanup(parentId) {
	parentId = parentId.replace(/:/g, "\\:");
	parentId = parentId.replace(/\$/g, "\\$");
	parentId = parentId.replace(/\./g, "\\.");
	
	return "#" + parentId;
}

function typeChooser(obj, parentId) {
	for (property in obj) {
		if (property.indexOf("_") == 0) { continue; }
		switch ($.type(obj[property])) {
		case "function":
			break;
		case "object":
			renderObject(obj[property], property, "object", parentId);
			break;
		case "array":
			renderObject(obj[property], property, "array", parentId);
			break;
		default:
			addHtml(valueAsHtml(obj[property], property, parentId), parentId);
			break;
		}
	}
}

function renderObject(obj, propertyName, type, parentId) {
	thisId = getId();
	addHtml(objAsHtml(propertyName, parentId, type, thisId), parentId);
	typeChooser(obj, thisId);
}

function addHtml(html, parentId) {
	$(parentIdCleanup(parentId)).append(html);
}