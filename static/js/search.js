$(document).ready(function(){
	if (!collectionId) {
		$("#search-terms").keypress(
			function(evt){
				var keyNum;
				if (window.event) { keyNum = evt.keyCode; }
				else { keyNum = evt.which; }
				
				if(keyNum == 13) { 
					performSearch("full", $("#search-terms").val(), 0);
				}
			}
		);
		
		if($("#search-terms").val()){ 
			performSearch("full", $("#search-terms").val(), 0); 
		}	
	} else {
		performSearch("collection", collectionId, 0);
	}	
});

function performSearch(index, terms, skip) {
	searchObj = { index: index, 
				terms: escape(terms), 
				limit: 10, 
				skip: skip};
	
	///Send request to get the search results
	$.post("/search/", searchObj, function(response) {
		console.log(response); ///For debug purpose, to monitor the response object
		searchResults(index, escape(terms), response, Math.ceil(skip / 10) + 1);		
	});
}

function searchResults(index, terms, response, currentPageNum){
	$("#results-container").empty(); ///Clear the previous search results
	$("#page-switcher").empty(); ///Clear the page switcher
	///Set number of results found
	if(response.code == 400){
		$("#results-container").append("<h2>Please input keyword for search!</h2>");
		return;
	}
	
	if (!collectionId) { $("#results-container").append("<h2>You found " + response.total_rows + " results</h2>"); }
	else { $("#results-container").append("<h2>Containing " + response.total_rows + " records</h2>"); }	
	
	listSearchResults(response.rows);
	
	if(response.total_rows){
		pageSwitcher(index, terms, response.total_rows, currentPageNum);
	}	
}

function pageSwitcher(index, terms, numRows, currentPageNum){
	
	var numPages = Math.ceil(numRows / 10);
	
	///Add function to the first page
	if(currentPageNum != 1){
		$("#page-switcher").append(getPagerNumItem(index, terms, 0, "pager-first", "&lt;&lt; first"));
	}	
	
	///Add function to the previous page
	if(currentPageNum != 1){
		$("#page-switcher").append(getPagerNumItem(index, terms, (currentPageNum - 2) * 10, "pager-pre", "&lt; previous"));
	}
	
	///Add page numbers
	for( iPg = 1; iPg <= numPages; iPg++) {
		var skipIndex = ( iPg - 1) * 10;

		$("#page-switcher").append(getPagerNumItem(index, terms, skipIndex, "pager-" + iPg, iPg));
	}
	
	///Add function to the next page
	if(currentPageNum != numPages){
		$("#page-switcher").append(getPagerNumItem(index, terms, currentPageNum * 10, "pager-nxt", "next &gt;"));
	}
	
	///Add function to the last page
	if(currentPageNum != numPages){
		$("#page-switcher").append(getPagerNumItem(index, terms, (numPages - 1) * 10, "pager-last", "last &gt;&gt;"));
	}
	
	$("#pager-" + currentPageNum).addClass("pager-current");	
}

function getPagerNumItem(index, terms, skipIndex, id, text){
		var strLi = "<li class='pager-item' id=";
		strLi += id;
		strLi += " onclick=";
		strLi += "performSearch("
		strLi += "&#39;" + index + "&#39;,";
		strLi += "&#39;" + terms + "&#39;,";
		strLi += skipIndex + ")";
		strLi += ">";
		strLi += text;
		strLi += "</li>";
		
		return strLi;	
}

///List the search results in "results-container" element
///Parameters:
/////rows - search results object
function listSearchResults(rows) {
	///List the search results
	$("#results-container").append("<dl id='results' class='search-results'></dl>");

	///Parse each search result object
	for( var iObj = 0; iObj < rows.length; iObj++) {
		eachResult("#results", rows[iObj]);
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
	titleString += "</a>";
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
	var valueString = "";
	for(var iTy = 0; iTy < types.length; iTy ++){
		var type = types[iTy];
		var value = values[iTy];
		
		if(value) {
			
			///Set connection symbol between different kinds of information
			if(valueString){
				valueString += " - ";
			}
			
			///Parse different information using different way
			switch (type){
				case "Authors":
					var authors = "";
					for(var iAu = 0; iAu < value.length; iAu ++){
						if(iAu == 0){
							authors = value[iAu].Name || value[iAu].OrganizationName;
						}else{
							authors += ", " + value[iAu].Name || value[iAu].OrganizationName;
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

/**********************Page Switcher****************************************/
function addPager(resultCount){
	var pageCount = (resultCount - 1) / 10 + 1;	
	
	$("#page-switcher").append("<ul id='pager'>");
	
	$("#page-switcher").append("</ul>");
}
