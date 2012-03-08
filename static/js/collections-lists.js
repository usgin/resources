function showRecords(collectionId) {
	var titleTriangleEle = $("#" + collectionId + "-container > .block-title > span");
	
	attachRecords(collectionId, collectionId, titleTriangleEle);	
}

///Attach the results to a specific container element
////Parameters:
////searchTerm - collection ID used for search keyword
////collectionEleId - the selected collection element id; string type
////titleTriangleEle - the expand triangle symbol element
function attachRecords(searchTerm, collectionEleId, titleTriangleEle){
	var contentEle = $("#" + collectionEleId);
	
	if (contentEle.children().length > 0) {
///**********Close the collection container*********************		
		expandSymbolChange(false, titleTriangleEle); ///Change the expand symbol
		clearCollectionContent(collectionEleId);
		
	} else {
///*********Expand the collection container*********************
		expandSymbolChange(true, titleTriangleEle); ///Change the expand symbol
		addCollectionContent(searchTerm, collectionEleId);		

	}	
}

function clearCollectionContent(collectionEleId) {
	var contentEle = $("#" + collectionEleId);
	contentEle.empty();
}

function addCollectionContent(searchTerm, collectionEleId) {
	var contentEle = $("#" + collectionEleId);
	
	/// Search records in the repository database with a specific collection ID
	searchObj = {
		index : "collection",
		terms : searchTerm
	};
	
	/// Search childern collection with a specific parent collection ID
	searchChildrenCollectionObj = {
		index : "parent", ///Attribute name in the fulltext property in collections/_design/indexes, which is defined in indexes.js
		terms : searchTerm, ///The search term in the parent property
		limit : 9000 
	};
	
	$.post("/search/", searchObj, function(response) {
		for(r in response.rows) { 
			contentEle.append(getHtmlRecord(response.rows[r], collectionEleId));
		}
		
		/// Set collection search after the record search is completed
		$.post("/collection-search/", searchChildrenCollectionObj, function(response) {
			for(r in response.rows) { 
				contentEle.append(getHtmlCollection(response.rows[r], collectionEleId));
			}
		});
	});
}
////////////////////////////////////////////////////////////////////////////////////////////////
///Get collection with children
///Parameters:
////collection - the collection search result
////collectionEleId - the collection content element id
function getHtmlCollection(collection, collectionEleId) {	
	var collectionId = collection.id + "-" + collectionEleId;
	var collectionLink = "/collection/" + collection.id;
	
	var html = "<li id='" + collectionId + "-container' class='record-container collection-item'>";
	html += "<span class='ui-icon ui-icon-triangle-1-e collection-list-expand'";
	html += " onclick='collectionExpand(&#39;" + collectionId + "&#39;)'"; /// Use escape symbol to identify the quote symbol pair
	html += "></span>";
	html += "<a href='" + collectionLink + "'>";
	html += collection.doc.Title || "No Title Was Given";
	html += "</a>";
	if(authenticated){
		html += getToolbarHtml(collection.id, collectionEleId, true); /// Add toolbar after each collection
	}
	html += "<ul id='" + collectionId + "' class='record-list record-inner-list'></ul>"; /// This is the collection content element
	html += "</li>";
	
	return html;	
}

function collectionExpand(collectionEleId){
	var titleTriangleEle = $("#" + collectionEleId + "-container > span");
	
	attachRecords(collectionEleId.split("-")[0], collectionEleId, titleTriangleEle);
}

////////////////////////////////////////////////////////////////////////////////////////////////
///Get single record without children
///Parameters:
////record - the record search result
////collectionEleId - the id of the collection content element which contains this record
function getHtmlRecord(record, collectionEleId) {
	
	var recordContainerId = record.id + "-" + collectionEleId;
	var recordLink = "/resource/" + record.id + "/html";
	
	var html = "<li id='" + recordContainerId + "' class='record-container'>";
	html += "<a href=" + recordLink + " class='record-item-link'>";
	html += record.doc.Title || "No Title Was Given";
	html += "</a>";
	if(authenticated){
		html += getToolbarHtml(record.id, collectionEleId, false); ///Add toolbar after each record
	}	
	html += "</li>";
	
	return html;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
///Change the triangle symbol in title bar
function expandSymbolChange(isExpand, triangleEle){
	if(isExpand){
		triangleEle.removeClass("ui-icon-triangle-1-e");
		triangleEle.addClass("ui-icon-triangle-1-s");		
	}else{
		triangleEle.removeClass("ui-icon-triangle-1-s");
		triangleEle.addClass("ui-icon-triangle-1-e");
	}
}

