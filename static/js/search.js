var key;

function enterPressed(evt) {
	var keyCode;
	if(window.event){
		keyCode = evt.keyCode;
	}else if(evt.which){
		keyCode = evt.which;
	}else{
		return true;
	}
	
	if(keyCode == 13){
		performSearch();
		return false;
	}else{
		return true;
	}
}

function performSearch() {
	searchObj = { full: escape($("#search-terms").val()) }; ///Get the value from the edit-box
	
	///Send request to get the search results
	$.post(document.url, searchObj, function(response) {
		console.log(response); ///For debug purpose, to monitor the response object
		listSearchResults(response);		
	});
}

///List the search results in "results-container" element
///Parameters:
/////response - search results object
function listSearchResults(response) {
	$("#results-container").empty(); ///Clear the previous search results
	///Set number of results found
	$("#results-container").append("<h2>You found " + response.length + " results</h2>");
	///List the search results
	$("#results-container").append("<dl id='results' class='search-results'></dl>");

	///Parse each search result object
	for( iObj = 0; iObj < response.length; iObj++) {
		eachResult("#results", response[iObj]);
	}
}

function eachResult(containerId, thisRespObj) {
	///Set title item
	$(containerId).append(getResultTitleDt(thisRespObj.id, thisRespObj.doc.Title));
	///Set description and other information
	$(containerId).append(getResultDetailDd(thisRespObj));
	
}

///Return the string of the title element
///Parameters:
/////id - this result object's id
/////title - this result object's title
function getResultTitleDt(id, title) {
	var hLink = "/resource/" + id +"/html"; ///Define the link to metadata
	
	var titleString = "<dt>";
	titleString += "<a href=" + hLink + " class='search-results-title'>";
	titleString += title; ///Define the title content
	titleString += "</a>"
	titleString += "</dt>";

	return titleString;
}

///Return the string of other information element
///Parameters:
/////thisResp - this search result object
function getResultDetailDd(thisResp) {
	var detailString = "<dd>";
	
	///Get description string	
	detailString += getProps("Description", thisResp.doc.Description, "search-results-description");
	///Get author and date information string
	rInfoTypes = ["Authors", "PublishDate", "ModifyDate"];
	rInfoValues = [thisResp.doc.Authors, thisResp.doc.PublicationDate, thisResp.doc.ModifiedDate];	
	detailString += getProps(rInfoTypes, rInfoValues, "search-results-info");
	
	detailString += "</dd>";
	
	return detailString;
}

///Return the string of the search result information elements
///Parameters:
/////propType - the type/type array for this property
/////propValue - the value/value array for this property
/////idClass - the id used to apply css for those element(s) 
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

///Return the string of a single property element
///Parameters:
/////type - a single property type
/////value - a single property value
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


///Return the string of property array elements
///Parameters:
/////types - the property type array
/////values - the property value array
function parseValues(types, values) {
	var isDash = false;
	var valueString = "";
	for(iTy = 0; iTy < types.length; iTy ++){
		var type = types[iTy];
		var value = values[iTy];
		
		if(value) {
			
			///Set connection symbol between different kinds of information
			if(isDash){
				valueString += " - ";
			}
			isDash = true;
			
			///Parse different information using different way
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
