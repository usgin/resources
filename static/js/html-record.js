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
	
	var link_type = objGet(link, "Name", "Downloadable Files");
	if(link_type == "Downloadable Files"){
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

///*********************Add map to the sidebar********************************/
///Create a map and add this map to the sidebar
///Parameters:
////idMap - the element id where the map is
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
    
    if(geoExtent){
	     if(Math.abs(geoExtent.WestBound) < 180
	    	|| Math.abs(geoExtent.SouthBound) < 180
	    	|| Math.abs(geoExtent.EastBound) < 180
	    	|| Math.abs(geoExtent.NorthBound) < 180
	    	) {
		    var extent = getExtent(geoExtent);
		    addBoundsGeometry(map, extent);
		    map.zoomToExtent(extent);	
	    }else{
	    	map.zoomToMaxExtent();
	    }   	
    }

}


///Return the spherical mercator extent
///Parameters:
////geoExtent - the WGS84 geographic extent
function getExtent(geoExtent){
	var tbPt = new OpenLayers.Geometry.Point(geoExtent.WestBound, geoExtent.SouthBound);
	var lbMerc = OpenLayers.Layer.SphericalMercator.forwardMercator(tbPt.x, tbPt.y);
	var rtPt = new OpenLayers.Geometry.Point(geoExtent.EastBound, geoExtent.NorthBound);
	var rtMerc = OpenLayers.Layer.SphericalMercator.forwardMercator(rtPt.x, rtPt.y);
	return new OpenLayers.Bounds(lbMerc.lon, lbMerc.lat, rtMerc.lon, rtMerc.lat);
}

///Add the bounding box geometry into the map
///Parameters:
////map - the map where the geometry should be added into
////bounds - the spherical mercator bounding box
function addBoundsGeometry(map, bounds){
	var poly = bounds.toGeometry();
	var vector = new OpenLayers.Layer.Vector();
	vector.styleMap = new OpenLayers.StyleMap({
		"default" : new OpenLayers.Style({
			fillOpacity: 0.2,
			fillColor: "#F08B6F",
			strokeColor : "#F08B6F",
			strokeWidth : 2
		})	
	});
	vector.addFeatures([new OpenLayers.Feature.Vector(poly)]);
	map.addLayer(vector);	
}


