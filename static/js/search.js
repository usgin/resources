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
	$("#results-container").append("<dl id='results'></dl>");

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
	
	var titleString = "<dt class='search-result-title'>";
	titleString += "<a href=" + hLink + ">";
	titleString += title; ///Define the title content
	titleString += "</a>"
	titleString += "</dt>";

	return titleString;
}

function getResultDetailDd(thisResp) {
	var detailString = "<dd class='search-result-detail'>";	
	detailString += getProps("Description", thisResp.doc.Description);
	detailString += getProps("Publication Date", thisResp.doc.PublicationDate);
	detailString += getProps("Modified Date", thisResp.doc.ModifiedDate);
	detailString += "</dd>";
	
	return detailString;
}

function getProps(propName, propValue){
	if(propValue){
		var propString = "<p>";
		propString += "<strong>" + propName + ": </strong>";
		propString += propValue.slice(0, 200); ///Get first 200 letters of the string
		if(propValue.length > 200) {propString += " . . . ";}
		propString += "</p>"; 
		
		return propString;		
	}else{
		return "";
	}

}
