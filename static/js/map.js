///Global variables needed: map
var map;
///*********************Add map to the sidebar********************************/
///Create a map and add this map to the sidebar
///Parameters:
////idMap - the element id where the map is
function addMap(idMap, geoExtent){
	map = new OpenLayers.Map(idMap, {
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
    
	var vector = new OpenLayers.Layer.Vector();
	vector.styleMap = getLayerStyle();
	map.addLayer(vector);
	
    if(geoExtent){
	     if(Math.abs(geoExtent.WestBound) < 180
	    	|| Math.abs(geoExtent.SouthBound) < 180
	    	|| Math.abs(geoExtent.EastBound) < 180
	    	|| Math.abs(geoExtent.NorthBound) < 180
	    	) {
		    var extent = getExtent(geoExtent);
		    addBoundsGeometry(map, vector, extent);
		    map.zoomToExtent(extent);	
	    }else{
	    	map.zoomToMaxExtent();
	    }   	
    }

}

function getLayerStyle(){
	var styleMap = new OpenLayers.StyleMap({
		"default": new OpenLayers.Style({
			fillOpacity: 0.2,
			fillColor: "#F08B6F",
			strokeColor : "#F08B6F",
			strokeWidth : 2
		}),
		"temporary": new OpenLayers.Style({
			fillOpacity: 0.2,
			fillColor: "#F08B6F",
			strokeColor : "#F08B6F",
			strokeWidth : 2
		})	
	});
	
	return styleMap;
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
////vector - the layer where the bounding box is added
////bounds - the spherical mercator bounding box
function addBoundsGeometry(map, vector, bounds){
	var poly = bounds.toGeometry();
	vector.addFeatures([new OpenLayers.Feature.Vector(poly)]);	
}

///*********************Add toolbar above the map********************************/

var controlDrawBox = new OpenLayers.Control({
	draw : function() {
		this.box = new OpenLayers.Handler.Box(controlDrawBox, {
			"done" : this.notice
		})
		this.box.activate();
	},
	notice : function(bounds) {
		//alert(bounds);
	}
});



function addMapEditorTool(idMapToolbar){
	map.addControl(controlDrawBox);
	$("#map-edit-tool").button({
		icons:{
			primary: "ui-icon-pencil"
		},
		text: false
	});
	
	$("#map-edit-tool").toggle(
		function() {
			controlDrawBox.activate();
			map.controls[0].deactivate();
			$("#map-edit-tool").addClass("ui-state-press");
		}, function() {
			controlDrawBox.deactivate();
			map.controls[0].activate();
			$("#map-edit-tool").removeClass("ui-state-press");
		}
	)
}

