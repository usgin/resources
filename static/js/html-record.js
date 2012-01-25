///Variables from html-record.jade
////links - links array
////geoExtent - the geographic extent for ths record
////collIds - collection ids array for this record
var resp;

$(document).ready(function(){
	// Add links to the collections for this record
	if(collIds && collIds.length > 0){
		$.post("/collection-names", { ids: collIds }, function(response) {
			resp = response;
			for(var iColl = 0; iColl < response.length; iColl ++){
				addCollection(response[iColl]);
			}
		});		
	} else {
		$("#collections-menu").append("<li>Not included in any collections</li>");
	}
	
	// Add the edit button
	$("#edit-button").button();
	
	// Add Geographic Extent Map
	addMap("map", geoExtent);
	
	// Shuffle the sidebar
	$("#site-info-block").insertAfter("#formal-metadata-block");
});

function addCollection(collection){	
	var strMenuItem = "<li>";
	strMenuItem += "<a href=";
	strMenuItem += "/collection/" + collection.id;
	strMenuItem += ">";
	strMenuItem += collection.value.title;
	strMenuItem += "</a>";
	strMenuItem += "</li>";
	
	$("#collections-menu").append(strMenuItem);
		
}




