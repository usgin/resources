var geoExtentId = "#theResource-GeographicExtent";

$(document).ready(function(){
	var geoExtent = getGeoExtent(geoExtentId);
	addMap("map", geoExtent);
	addMapEditorTool();

});

function getGeoExtent(idGeoExtentEle){
	var geoExtVal = {};
	lis = $(geoExtentId).children("li");
	for (var i = 0; i < lis.length; i++) {
		attr = $(lis[i]).children("span.label").html();
		val = $(lis[i]).children("input").val();
		if (parseFloat(val)) { geoExtVal[attr] = parseFloat(val); }
		else { geoExtVal[attr] = 999; }
	}	
	return geoExtVal;
}


function setGeoExtent(geoExtent){
	$(geoExtentId).children("li").each(function() {
		switch ($(this).children("span.label").html()) {
			case "NorthBound": ext = geoExtent.top; break;
			case "SouthBound": ext = geoExtent.bottom; break;
			case "EastBound": ext = geoExtent.right; break;
			case "WestBound": ext = geoExtent.left; break;
		}
		$(this).children("input").val(ext);
	});		
}