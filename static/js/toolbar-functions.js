$(document).ready(function() {
	initAddCollectionDialog("add-collection-dialog");
	initAddRecordDialog("add-record-dialog");
});

function initAddCollectionDialog(dialId){
	$("#" + dialId).dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 500,
		title: "Add Collection",
		buttons: {
			"Add": function() {
				addCollection2Collection();
				$(this).dialog("close");
			},
			"Cancel": function() {
				$(this).dialog("close");
			}
		},
		open: function(evt, ui){
			$("#input-collection-name").val("");
			$.post("/collection-names", { ids: "all" }, function(response) {
				var collections = [];
				for (var r in response) { 
					collections.push(
						{ 
							id: response[r].id, 
							value: response[r].value.title 
						}
					); 
				}
				
				$("#input-collection-name").autocomplete({
					source: collections,
					select: function(event, ui) {
						$("#selected-collection-id").val(ui.item.id);
						$(this).val(ui.item.value);
						return false;
					}
				});
			});			
		}
	});
}

function addCollection2Collection(){
	var selectedCollectionId = $("#selected-collection-id").val();
	var parentCollectionId = $("#parent-collection-id").val();
	var refreshElementId = $("#refresh-element-id").val();
	
	/// Get the ParentCollections property from the collection dataset
	$.get("/collection/" + selectedCollectionId + "/attr/ParentCollections", function(data){
		data.push(parentCollectionId); /// Add 
		$.put("/collection/" + selectedCollectionId + "/attr/ParentCollections", data, function(response){
			refreshContent(refreshElementId);
		})
	});
}

function initAddRecordDialog(dialId){
	$("#" + dialId).dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 500,
		title: "Add Record",
		buttons: {
			"Add": function() {
				addRecord2Collection();
				$(this).dialog("close");
			},
			"Cancel": function() {
				$(this).dialog("close");
			}
		},
		open: function(evt, ui){
			$("#input-record-name").val("");
			$.get("/resource/attr/_id", function(ids) {
				$.get("/resource/attr/Title", function(titles){
					var records = [];
					for (var r in titles) {
						records.push(
							{
								id: ids[r],
								value: titles[r]
							}
						);
					}
					
					$("#input-record-name").autocomplete({
						source: records,
						select: function(event, ui) {
							$("#selected-record-id").val(ui.item.id);
							$(this).val(ui.item.value);
							return false;
						}
					});					
				})
			});			
		}
	});
}

function addRecord2Collection(){
	var selectedRecordId = $("#selected-record-id").val();
	var parentCollectionId = $("#collection-id").val();
	var refreshElementId = $("#refresh-collection-id").val();
	
	/// Get the ParentCollections property from the collection dataset
	$.get("/resource/" + selectedRecordId + "/attr/Collections", function(data){
		data.push(parentCollectionId); /// Add 
		$.put("/resource/" + selectedRecordId + "/attr/Collections", data, function(response){
			refreshContent(refreshElementId);
		})
	});		
}

/////////////////////////////////////////////////////////////////////////////////////////////////
function getObjId(id, parentId, pElementId){
	var obj = {
		id: id,
		parentId: parentId,
		parentElementId: pElementId
	};
	
	return obj;
}

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
	
	$("#parent-collection-id").val(objId.id);
	$("#refresh-element-id").val(objId.id + "-" + objId.parentElementId);
	
	$("#add-collection-dialog").dialog("open");
	
}

function deleteCollection(collectionId){
	var objId = JSON.parse(collectionId);
	
	/// Get the ParentCollections property from the collection dataset
	$.get("/collection/" + objId.id + "/attr/ParentCollections", function(data){
		data.splice(data.indexOf(objId.parentId), 1); /// Delete the parent collection id from the ParentCollections property in collections dataset
		$.put("/collection/" + objId.id + "/attr/ParentCollections", data, function(response){
			refreshContent(objId.parentElementId);
		})
	});
}

function addRecord(collectionId){
	var objId = JSON.parse(collectionId);
	
	$("#collection-id").val(objId.id);
	$("#refresh-collection-id").val(objId.id + "-" + objId.parentElementId);
	
	$("#add-record-dialog").dialog("open");
			
}

function deleteRecord(recordId){
	var objId = JSON.parse(recordId);
	
	/// Get the Collections property from the repository dataset
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
