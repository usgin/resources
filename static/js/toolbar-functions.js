function getObjId(id, parentId, pElementId){
	var obj = {
		id: id,
		parentId: parentId,
		parentElementId: pElementId
	};
	
	return obj;
}
/////////////////////////////////////////////////////////////////////////////////////////////////
///Add and delete buttons after each record
function getToolbarHtml(id, parentCollectionEleId, isCollection){
	var parentCollectionId = parentCollectionEleId.split("-")[0];
	var objId = getObjId(id, parentCollectionId, parentCollectionEleId);
	var html;
	if(isCollection){
		html = "<div class='collection-toolbar'>";
		html += getAddCollectionHtml(objId);
		html += getAddRecordHtml(objId);
		html += getDeleteCollectionHtml(objId);
		html += "</div>";
	}else{
		html = "<div class='record-toolbar'>";
		html += getDeleteRecordHtml(objId);
		html += "</div>";
	}
	
	return html;
}

function getAddCollectionHtml(collectionId){
	var html = "<span onclick='addCollection(&#39;" + JSON.stringify(collectionId) + "&#39;)' "; 
	html += "class='ui-icon ui-icon-folder-collapsed' />";
	
	return html;
}

function getDeleteCollectionHtml(collectionId){
	var html = "<span onclick='deleteCollection(&#39;" + JSON.stringify(collectionId) + "&#39;)' ";
	html += "class='ui-icon ui-icon-trash' />";
	
	return html; 
}

function getAddRecordHtml(collectionId){
	var html = "<span onclick='addRecord(&#39;" + JSON.stringify(collectionId) + "&#39;)' "; 
	html += "class='ui-icon ui-icon-document' />";
	
	return html;
}

function getDeleteRecordHtml(recordId){
	var html = "<span onclick='deleteRecord(&#39;" + JSON.stringify(recordId) + "&#39;)' ";
	html += "class='ui-icon ui-icon-trash' />";
	
	return html; 	
}

////////////////////////////////////////////////////////////////////////////////////////////////
///Add and delete functions on the title bar
jQuery.put = function(url, data, callback) {
       $.ajax({
               url: url,
               type: "put",
               contentType: "application/json",
               data: JSON.stringify(data),
               success: callback                       
       });
};

function addCollection(collectionId){
	var objId = JSON.parse(collectionId);
}

function deleteCollection(collectionId){
	var objId = JSON.parse(collectionId);
	
	$.get("/collection/" + objId.id + "/attr/ParentCollections", function(data){
		data.splice(data.indexOf(objId.parentId), 1);
		$.put("/collection/" + objId.id + "/attr/ParentCollections", data, function(response){
			refreshContent(objId.parentElementId);
		})
	});
}

function addRecord(collectionId){
	var objId = JSON.parse(collectionId);
			
}

function deleteRecord(recordId){
	var objId = JSON.parse(recordId);
	
	$.get("/resource/" + objId.id + "/attr/Collections", function(data){
		data.splice(data.indexOf(objId.parentId), 1);
		$.put("/resource/" + objId.id + "/attr/Collections", data, function(response){
			refreshContent(objId.parentElementId);
		})
	});
	
}

function refreshContent(parentEleId){
	clearCollectionContent(parentEleId);
	collectionExpand(parentEleId)	
}
