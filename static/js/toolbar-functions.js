$(document).ready(function() {
	initAddCollectionDialog("add-collection-dialog");
	initAddRecordDialog("add-record-dialog");
	initDeleteCollectionDialog("delete-collection-dialog");
	initDeleteRecordDialog("delete-record-dialog");
});

function initAddCollectionDialog(dialId){
	$("#" + dialId).dialog({
		autoOpen: false,
		modal: true,
		resizable: false,
		width: 500,
		title: "Add Collection",
		buttons: {
			"New Collection": function(){
				window.open("/new-collection/");
				$(this).dialog("close");
			},
			"Add": function() {
				if($("#" + dialId + " > input").val()){
					addCollection2Collection(dialId);
				}else{
					
				}				
				$(this).dialog("close");
			},
			"Cancel": function() {
				$(this).dialog("close");
			}
		},
		open: function(evt, ui){
			var inputElement = $("#" + dialId + " > input");
			var selectedIdInAutoPopup = $("#" + dialId + " > .selected-item-id");
			
			inputElement.val(""); /// Clear the input box
			
			/// Get the array for all the collection names 
			$.post("/collection-names", { ids: "all" }, function(response) {
				var collections = [];
				for (var i = 0; i < response.length; i ++) { 
					collections.push(
						{ 
							id: response[i].id, 
							value: response[i].value.title /// value will be displayed in the autocomplete popup
						}
					); 
				}
				
				inputElement.autocomplete({
					source: collections,
					select: function(event, ui) {
						selectedIdInAutoPopup.val(ui.item.id);
						$(this).val(ui.item.value);
						return false;
					}
				});
			});			
		}
	});
}

function addCollection2Collection(dialId){
	var selectedCollectionId = $("#" + dialId + " > .selected-item-id").val();
	var parentCollectionId = $("#" + dialId + " > .parent-collection-id").val();
	var refreshElementId = $("#" + dialId + " > .refresh-element-id").val();
	
	/// Get the ParentCollections property from the collection dataset
	$.get("/collection/" + selectedCollectionId + "/attr/ParentCollections", function(data){
		if(data.error){return false;}
		
		if(!data.contains(parentCollectionId)){
			data.push(parentCollectionId); /// Add the parent collection id to current collection
		}

		$.put("/collection/" + selectedCollectionId + "/attr/ParentCollections", data, function(response){
			refreshContent(refreshElementId);
		});		
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
			"New Record": function(){
				window.open("/new-resource/");
				$(this).dialog("close");
			},
			"Add": function() {
				if($("#" + dialId + " > input").val()){
					addRecord2Collection(dialId);
				}else{
					
				}
				
				$(this).dialog("close");
			},
			"Cancel": function() {
				$(this).dialog("close");
			}
		},
		open: function(evt, ui){
			var inputElement = $("#" + dialId + " > input");
			var selectedIdInAutoPopup = $("#" + dialId + " > .selected-item-id");			
						
			inputElement.val(""); /// Clear the input box
			
			$.get("/resource/attr/_id", function(ids) { /// Get all record ids
				$.get("/resource/attr/Title", function(titles){ /// Get all record titles
					var records = [];
					for (var i = 0; i < titles.length; i ++) {
						records.push(
							{
								id: ids[i],
								value: titles[i]
							}
						);
					}
					
					inputElement.autocomplete({
						source: records,
						select: function(event, ui) {
							selectedIdInAutoPopup.val(ui.item.id);
							$(this).val(ui.item.value);
							return false;
						}
					});					
				})
			});			
		}
	});
}

function addRecord2Collection(dialId){
	var selectedRecordId = $("#" + dialId + " > .selected-item-id").val();
	var parentCollectionId = $("#" + dialId + " > .parent-collection-id").val();
	var refreshElementId = $("#" + dialId + " > .refresh-element-id").val();
	
	/// Get the ParentCollections property from the collection dataset
	$.get("/resource/" + selectedRecordId + "/attr/Collections", function(data){
		if(data.error){return false;}
		
		if(!data.contains(parentCollectionId)){
			data.push(parentCollectionId); /// Add the parent collection id to current record
		}
		
		$.put("/resource/" + selectedRecordId + "/attr/Collections", data, function(response){
			refreshContent(refreshElementId);
		});
	});		
}

function initDeleteCollectionDialog(dialId){
	$("#" + dialId).dialog({
		autoOpen: false,
		resizable: false,
		height: 60,
		width: 350,
		modal: true,
		title: "Are you sure to delete this collection?",
		buttons : {
			"Delete" : function() {
				deleteCollectionDialog(dialId);
				$(this).dialog("close");
			},
			Cancel : function() {
				$(this).dialog("close");
			}
		}
	});
}

function deleteCollectionDialog(dialId){
	var selectedCollectionId = $("#" + dialId + " > .selected-item-id").val();
	var parentCollectionId = $("#" + dialId + " > .parent-collection-id").val();
	var refreshElementId = $("#" + dialId + " > .refresh-element-id").val();	
	
	/// Get the ParentCollections property from the collection dataset
	$.get("/collection/" + selectedCollectionId + "/attr/ParentCollections", function(data){
		data.splice(data.indexOf(parentCollectionId), 1); /// Delete the parent collection id from the ParentCollections property in collections dataset
		$.put("/collection/" + selectedCollectionId + "/attr/ParentCollections", data, function(response){
			refreshContent(parentCollectionId);
		})
	});	
}

function initDeleteRecordDialog(dialId){
	$("#" + dialId).dialog({
		autoOpen: false,
		resizable: false,
		height: 60,
		width: 350,
		modal: true,
		title: "Are you sure to delete this record?",
		buttons : {
			"Delete" : function() {
				deleteRecordDialog(dialId);
				$(this).dialog("close");
			},
			Cancel : function() {
				$(this).dialog("close");
			}
		}
	});	
}

function deleteRecordDialog(dialId){
	var selectedRecordId = $("#" + dialId + " > .selected-item-id").val();
	var parentCollectionId = $("#" + dialId + " > .parent-collection-id").val();
	var refreshElementId = $("#" + dialId + " > .refresh-element-id").val();	
	
	/// Get the Collections property from the repository dataset
	$.get("/resource/" + selectedRecordId + "/attr/Collections", function(data){
		data.splice(data.indexOf(parentCollectionId), 1);
		$.put("/resource/" + selectedRecordId + "/attr/Collections", data, function(response){
			refreshContent(refreshElementId);
		})
	});	
}

/////////////////////////////////////////////////////////////////////////////////////////////////
///Create the id object
///id - id of the current selected 
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
	
	///Set global values for the dialog/////////////////////////////////////////
	/// Identify the current collection where the new collection will be added
	$("#add-collection-dialog > .parent-collection-id").val(objId.id); 
	/// Identify the current collection element which needs to be refreshed
	$("#add-collection-dialog > .refresh-element-id").val(objId.id + "-" + objId.parentElementId); 
	
	$("#add-collection-dialog").dialog("open");
	
}

function deleteCollection(collectionId){
	var objId = JSON.parse(collectionId);

	///Set global values for the dialog/////////////////////////////////////////////
	/// Identify the parent collection where the selected collection will be deleted
	$("#delete-collection-dialog > .selected-item-id").val(objId.id);
	/// Identify the parent collection element
	$("#delete-collection-dialog > .parent-collection-id").val(objId.parentId); 
	/// Identify the parent collection element which needs to be refreshed
	if(objId.parentElementId.indexOf("-conatainer")){
		$("#delete-collection-dialog > .refresh-element-id").val(objId.parentElementId);
	}else{
		$("#delete-collection-dialog > .refresh-element-id").val(objId.parentElementId + "-container");
	}
	
	$("#delete-collection-dialog").dialog("open"); 	
}

function addRecord(collectionId){
	var objId = JSON.parse(collectionId);
	
	///Set global values for the dialog/////////////////////////////////////////
	/// Identify the current collection where the new record will be added
	$("#add-record-dialog > .parent-collection-id").val(objId.id); 
	/// Identify the current collection element which needs to be refreshed
	$("#add-record-dialog > .refresh-element-id").val(objId.id + "-" + objId.parentElementId); 
	
	$("#add-record-dialog").dialog("open");
			
}

function deleteRecord(recordId){
	var objId = JSON.parse(recordId);

	///Set global values for the dialog/////////////////////////////////////////////
	/// Identify the parent collection where the selected record will be deleted
	$("#delete-record-dialog > .selected-item-id").val(objId.id);
	/// Identify the parent collection element
	$("#delete-record-dialog > .parent-collection-id").val(objId.parentId); 
	/// Identify the parent collection element which needs to be refreshed
	if(objId.parentElementId.indexOf("-conatainer")){
		$("#delete-record-dialog > .refresh-element-id").val(objId.parentElementId);
	}else{
		$("#delete-record-dialog > .refresh-element-id").val(objId.parentElementId + "-container");
	}	
	
	$("#delete-record-dialog").dialog("open"); 
}

function refreshContent(parentEleId){
	clearCollectionContent(parentEleId);
	
	var titleTriangleEle = $("#" + parentEleId + "-container > span");
	
	/// Identify if this is a top level collection
	if(parentEleId .split("-").length == 1){
		titleTriangleEle = $("#" + parentEleId + "-container > .block-title > span"); /// Identify top level title bar triangle
	}
	
	attachRecords(parentEleId .split("-")[0], parentEleId, titleTriangleEle);

}

/////////////////////////////////////////////////////////////////////////////////////////////////
///Process the top-level toolbar

function addTopCollection(id){
	///Set global values for the dialog/////////////////////////////////////////
	/// Identify the current collection where the new collection will be added
	$("#add-collection-dialog > .parent-collection-id").val(id); 
	/// Identify the current collection element which needs to be refreshed
	$("#add-collection-dialog > .refresh-element-id").val(id); 
	
	$("#add-collection-dialog").dialog("open");	
}

function addTopRecord(id){
	///Set global values for the dialog/////////////////////////////////////////
	/// Identify the current collection where the new record will be added
	$("#add-record-dialog > .parent-collection-id").val(id); 
	/// Identify the current collection element which needs to be refreshed
	$("#add-record-dialog > .refresh-element-id").val(id); 
	
	$("#add-record-dialog").dialog("open");	
}
