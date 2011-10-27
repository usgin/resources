function domChooser(ele, parentObj) {
	// Grab the name of the property
	var propertyName = ele.find("div > div[ele='attribute']").html();
	
	// DOM li nodes containing ul eles are objects, otherwise they are property/value pairs
	if (ele.children("ul").length > 0) {
		switch (ele.find("div > div[ele='attribute']").attr("eletype")) {
		case "array":
			addObject(propertyName, ele, [], parentObj);
			break;
		case "object":
			addObject(propertyName, ele, {}, parentObj);
			break;
		}
	} else {
		parentObj[propertyName] = ele.find("div > div[ele='value']").html();
	}
}

function addObject(propertyName, ele, newObj, parentObj) {
	var attributeList = ele.children("ul");
	var attributes = parentObj[propertyName] = newObj;
	
	attributeList.children().each(function(index, subEle) {
		domChooser($(this), attributes);
	});
}