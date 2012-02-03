$(document).ready(function() {
		
});

function recordAsHtml(record, collectionId) {
	html = "<div id='" + record.id + "-container' class='record-container clear-block'>";
	//html += "<div id=\"" + record.id + "-remove-button\" class=\"record-remove-button\" onclick=\"removeRecord(\'" + record.id + "\', \'" + collectionId + "\')\"></div>";
	html += "<strong><a href='/resource/" + record.id + "/html'>" + record.doc.Title || "No Title Was Given" + "</a></strong>";
	html += "</div>";
	return html;
}

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
	contentEle.removeClass("list-separator");
}

function addCollectionContent(contentEle, collectionId) {	
	searchObj = {
		index : "collection",
		terms : collectionId
	};
	
	$.post("/search/", searchObj, function(response) {
		for(r in response.rows) { thisDoc = response.rows[r].doc, thisId = response.rows[r].id;
			contentEle.addClass("list-separator");
			contentEle.append(recordAsHtml(response.rows[r], collectionId));
		}
	});
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
