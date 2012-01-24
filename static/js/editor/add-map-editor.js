$(document).ready(function(){
	var geoExtent = getGeoExtent("#GeographicExtent");
	addMap("map", geoExtent);
	addMapEditorTool("map-toolbar");

})

function getGeoExtent(idGeoExtentEle){
	var geoExtVal = {};
	var arrayAttributes = $("#GeographicExtent > li > div > div[ele=attribute]");
	var arrayValues = $("#GeographicExtent > li > div > div[ele=value]");
	if(arrayAttributes.length == 4 && arrayValues.length == 4){
		for(iPair = 0; iPair < 4; iPair ++){
			var attr = arrayAttributes[iPair].innerHTML;
			var val = arrayValues[iPair].innerHTML;
			
			if(parseFloat(val)){
				geoExtVal[attr] = parseFloat(val);
			}else{
				geoExtVal[attr] = 999;
			}
			
		}
	}
	
	return geoExtVal;
}


function setGeoExtent(geoExtent){
		
	if($("#GeographicExtent-container").length < 1){ addGeographicExtent(); }
	
	var arrayAttributes = $("#GeographicExtent > li > div > div[ele=attribute]");
	var arrayValues = $("#GeographicExtent > li > div > div[ele=value]");

	for( iPair = 0; iPair < 4; iPair++) {
		switch(arrayAttributes[iPair].innerHTML) {
			case "NorthBound":
				arrayValues[iPair].innerHTML = geoExtent.top;
				break;
			case "SouthBound":
				arrayValues[iPair].innerHTML = geoExtent.bottom;
				break;
			case "WestBound":
				arrayValues[iPair].innerHTML = geoExtent.left;
				break;
			case "EastBound":
				arrayValues[iPair].innerHTML = geoExtent.right;
				break;
		}
	}
		
}