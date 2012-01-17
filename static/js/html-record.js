///Variables from html-record.jade
////links - links array

var service_types = {
		"OGC:WMS": "WMS GetCapabilities",
		"OGC:WFS": "WFS GetCapabilities",
		"OGC_WCS": "WCS GetCapabilities",
		"esri": "ESRI Service",
		"opendap": "OPeNDap Service"
};

$(document).ready(function(){
	for(iLink = 0; iLink < links.length; iLink ++){
		addOnlineFile(links[iLink]);
	}
	
	addMap("map");
});

function addOnlineFile(link){	
	var link_url = objGet(link, "URL", "Nothing");
	
	var link_type = objGet(link, "Name", "Downloadable");
	if(link_type == "Downloadable"){
		var service_type = objGet(link, "ServiceType", "");
		if(service_type){
			link_type = service_types[service_type];
		}
	}

	var strMenuItem = "<li>";
	strMenuItem += "<a href=";
	if(link_url != "Nothing"){
		strMenuItem += link_url;
	}else{
		strMenuItem += "*";
	}	
	strMenuItem += ">";
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

function addMap(idMap){
	var map = new OpenLayers.Map(idMap, {
		controls: [
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.ZoomPanel()
			]
	});
    var gphy = new OpenLayers.Layer.Google(
        "Google Physical",
        {type: google.maps.MapTypeId.TERRAIN}
    );
    map.addLayer(gphy);
    
    var extent = getExtent(geoExtent.WestBound, geoExtent.SouthBound, geoExtent.EastBound, geoExtent.NorthBound);
    
    addBoundsGeometry(map, extent);
    map.zoomToExtent(extent);
}

function getExtent(left, bottom, right, top){
	var tbPt = new OpenLayers.Geometry.Point(left, bottom);
	var lbMerc = OpenLayers.Layer.SphericalMercator.forwardMercator(tbPt.x, tbPt.y);
	var rtPt = new OpenLayers.Geometry.Point(right, top);
	var rtMerc = OpenLayers.Layer.SphericalMercator.forwardMercator(rtPt.x, rtPt.y);
	return new OpenLayers.Bounds(lbMerc.lon, lbMerc.lat, rtMerc.lon, rtMerc.lat);
}

var styleBounds = new OpenLayers.StyleMap({
	"default" : new OpenLayers.Style({
		fillColor : "#ffcc66",
		strokeColor : "#ff9933",
		strokeWidth : 2,
		graphicZIndex : 1
	})

});


var vector;
function addBoundsGeometry(map, bounds){
	var poly = bounds.toGeometry();
	vector = new OpenLayers.Layer.Vector({
		styleMap: styleBounds
	});
	vector.addFeatures([new OpenLayers.Feature.Vector(poly)]);
	map.addLayer(vector);	
}


