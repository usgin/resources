var str;

function performSearch() {
	searchObj = { full: escape($("#search-terms").val()) };
	$.post(document.url, searchObj, function(response) {
		console.log(response);
		listSearchResults(response);		
	});
}

function listSearchResults(response) {
	$("#results-container").empty();
	$("#results-container").append("<dl id='results' class='search-results'></dl>");

	for( iObj = 0; iObj < response.length; iObj++) {
		eachResult("#results", response[iObj]);
	}
}

function eachResult(containerId, thisRespObj) {
	///Set title item
	$(containerId).append(getResultTitleDt(thisRespObj.id, thisRespObj.doc.Title));
	
	$(containerId).append(getResultDetailDd(thisRespObj));
	
}

///Get the title element
///id, title: the id and title properties for this result
function getResultTitleDt(id, title) {
	var hLink = "http://localhost:3005/resource/" + id +"/html"; ///Define the link to metadata
	
	var titleString = "<dt>";
	titleString += "<a href=" + hLink + " class='search-results-title'>";
	titleString += title; ///Define the title content
	titleString += "</a>"
	titleString += "</dt>";

	return titleString;
}

function getResultDetailDd(thisResp) {
	var detailString = "<dd>";	
	detailString += getProps("Description", thisResp.doc.Description, "search-results-description");
	
	rInfoTypes = ["Authors", "PublishDate", "ModifyDate"];
	rInfoValues = [thisResp.doc.Authors, thisResp.doc.PublicationDate, thisResp.doc.ModifiedDate];	
	detailString += getProps(rInfoTypes, rInfoValues, "search-results-info");
	
	detailString += "</dd>";
	
	return detailString;
}

function getProps(propType, propValue, idClass){
	if(!propValue) {return "";}

	var propString;
	if(idClass) {
		propString = "<p class=" + idClass + ">";
	} else {
		propString = "<p>";
	}

	if(propType.constructor.toString().indexOf("Array") != -1) {
		propString += parseValues(propType, propValue);
	} else {
		propString += parseValue(propType, propValue);
	}
	propString += "</p>";

	return propString;
		


}

function parseValue(type, value) {
	switch (type){
		case "Description":
			if(value.length > 200) {
				return value.slice(0, 200) + " . . ."; 
			}else {
				return value;
			}
	}	
}

function parseValues(types, values) {
	var isDash = false;
	var valueString = "";
	for(iTy = 0; iTy < types.length; iTy ++){
		var type = types[iTy];
		var value = values[iTy];
		
		if(value) {
			
			if(isDash){
				valueString += " - ";
			}
			isDash = true;
			
			switch (type){
				case "Authors":
					var authors = "";
					for(iAu = 0; iAu < value.length; iAu ++){
						if(iAu == 0){
							authors = value[iAu].Name;
						}else{
							authors += ", " + value[iAu].Name;
						}
					}
					valueString += authors;
					break;
				case "PublishDate":
					value = value.replace("T", " ");
					value = value.replace("Z", " ");
					valueString += "Published on " + value;
					break;
				case "ModifyDate":
					value = value.replace("T", " ");
					value = value.replace("Z", " ");
					valueString += "Modified on " + value;
					break;
				default:
					valueString -= " - ";
					break;
			}			
		}			
	}
	
	return valueString;
}
