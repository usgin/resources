$(document).ready(function() {
		
});

function showRecords(collectionId) {
	var contentEle = $("#" + collectionId + "-record-list");
	
	if (contentEle.children().length > 0) {
///**********Close the collection container*********************		
		expandSymbolChange(false, collectionId); ///Change the expand symbol
		clearCollectionContent(contentEle, collectionId);
		
	} else {
///*********Expand the collection container*********************
		expandSymbolChange(true, collectionId); ///Change the expand symbol
		addCollectionContent(contentEle, collectionId);		

	}
}

function clearCollectionContent(contentEle, collectionId) {
	contentEle.empty();
}

function addCollectionContent(contentEle, collectionId) {
	/// Search records in the repository database with a specific collection ID
	searchObj = {
		index : "collection",
		terms : collectionId
	};
	
	$.post("/search/", searchObj, function(response) {
		for(r in response.rows) { 
			contentEle.append(getHtmlRecord(response.rows[r]));
		}
	});

	/// Search childern collection with a specific parent collection ID
	searchChildrenCollectionObj = {
		index : "parent", ///Attribute name in the fulltext property in collections/_design/indexes, which is defined in indexes.js
		terms : collectionId ///The parent collection ID
	};
		
	$.post("/collection-search/", searchChildrenCollectionObj, function(response) {
		for(r in response.rows) { 
			contentEle.append(getHtmlCollection(response.rows[r]));
		}
	});
}

function getHtmlCollection(collection) {
	var collectionContainerId = collection.id + "-container";
	
	var html = "<li id=" + collectionContainerId + " class='record-container collection-item'>";
	html += "<span class='ui-icon ui-icon-triangle-1-e collection-list-expand'></span>";
	html += "<a>";
	html += collection.doc.Title || "No Title Was Given";
	html += "</a>";
	html += "</li>";
	
	return html;	
}

function getHtmlRecord(record) {
	var recordContainerId = record.id + "-container";
	var recordLink = "/resource/" + record.id + "/html";
	
	var html = "<li id=" + recordContainerId + " class='record-container'>";
	html += "<a href=" + recordLink + ">";
	html += record.doc.Title || "No Title Was Given";
	html += "</a>";
	html += "</li>";
	
	return html;
}

///Change the triangle symbol in title bar
function expandSymbolChange(isExpand, collectionId){
	var titleTriangleEle = $("#" + collectionId + "-container > .block-title > span");
	if(isExpand){
		titleTriangleEle.removeClass("ui-icon-triangle-1-e");
		titleTriangleEle.addClass("ui-icon-triangle-1-s");		
	}else{
		titleTriangleEle.removeClass("ui-icon-triangle-1-s");
		titleTriangleEle.addClass("ui-icon-triangle-1-e");
	}
}

function deleteCollection(collectionId){
	
}

function addCollection(collectionId){
	
}
