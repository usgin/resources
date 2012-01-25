///Variables from html-record.jade
////links - links array
////geoExtent - the geographic extent for ths record
////collIds - collection ids array for this record
var service_types = {
		"OGC:WMS": "WMS Capabilities",
		"OGC:WFS": "WFS Capabilities",
		"OGC_WCS": "WCS Capabilities",
		"ESRI": "ESRI Service Endpoint",
		"OPENDAP": "OPeNDap Service"
};

var resp;

$(document).ready(function(){
	// Add schema.org microdata markup to content element
	$("#content").attr("itemscope", "");
	$("#content").attr("itemtype", "http://schema.org/CreativeWork");
	
	if(links){
		for(var iLink = 0; iLink < links.length; iLink ++){
			addOnlineFile(links[iLink]);
		}		
	}

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
	
	$("#edit-button").button();
	addMap("map", geoExtent);
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

function addOnlineFile(link){	
	var link_url = objGet(link, "URL", "Nothing");
	
	var link_type = objGet(link, "Name", "Downloadable Files");
	if(link_type == "Downloadable Files"){
		var service_type = objGet(link, "ServiceType", "").toUpperCase();
		if(service_type){
			if(service_types.hasOwnProperty(service_type)){
				link_type = service_types[service_type];
			}
		}
	}

	var strMenuItem = "<li>";
	strMenuItem += "<a href='";
	if(link_url != "Nothing"){
		strMenuItem += link_url;
	}else{
		strMenuItem += "*";
	}	
	strMenuItem += "' itemprop='url'>";
	strMenuItem += link_type;
	strMenuItem += "</a>";
	strMenuItem += "</li>";			
	$("#file-attachment-menu").append(strMenuItem);
}

///Get property value
function objGet(obj, prop, defVal){
	if(obj.hasOwnProperty(prop)){
		return obj[prop];
	}else{
		return defVal;
	}
}




