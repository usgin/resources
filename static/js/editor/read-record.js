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
		if (property.indexOf("HarvestInformation") == 0) { 
			harvestInfo = obj[property];
			continue; 
		}
		if (property.indexOf("Collections") == 0) {
			collectionsList = obj[property];
			continue;
		}
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
			addHtml(valueAsHtml(obj[property], property), parentId);
			break;
		}
	}
}

function renderObject(obj, propertyName, type, parentId) {
	switch (propertyName) {
	case "Authors":
		thisId = "Authors";
		break;
	case "Distributors":
		thisId = "Distributors";
		break;
	case "Links":
		thisId = "Links";
		break;
	case "GeographicExtent":
		thisId = "GeographicExtent";
		break;
	default:
		thisId = getId();
	}
	addHtml(objAsHtml(propertyName, type, thisId), parentId);
	addContactButton = parentId == "Authors" || parentId == "Distributors";
	addHtml(controlToolbar(thisId, true, true, addContactButton), thisId + "-header", true);
	typeChooser(obj, thisId);
}

function addHtml(html, parentId, shouldPrepend) {
	parent = $(parentIdCleanup(parentId));
	if (shouldPrepend) { parent.prepend(html); }
	else { $(parentIdCleanup(parentId)).append(html); }	
}