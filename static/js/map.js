///Global variables needed: map
var map;
///*********************Add map to the sidebar********************************/
///Create a map and add this map to the sidebar
///Parameters:
////idMap - the element id where the map is
var vector;
function addMap(idMap, geoExtent){
	map = new OpenLayers.Map(idMap, {
		controls: [
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.ZoomPanel()
			]
	});
	
	///Add google basemap
    var gphy = new OpenLayers.Layer.Google(
        "Google Physical",
        {type: google.maps.MapTypeId.TERRAIN}
    );
    map.addLayer(gphy);
    
    ///Add a vector layer
	vector = new OpenLayers.Layer.Vector();
	//vector.styleMap = getLayerStyle();
	map.addLayer(vector);
	
	///Add bounding box feature to the vector layer, and zoom to this extent
	///If the bounding box is invalid, zoom to the world extent
    if(geoExtent){
	     if(Math.abs(geoExtent.WestBound) < 180
	    	|| Math.abs(geoExtent.SouthBound) < 180
	    	|| Math.abs(geoExtent.EastBound) < 180
	    	|| Math.abs(geoExtent.NorthBound) < 180
	    	) {
		    var extent = getMercatorExtent(geoExtent);
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
		"select": new OpenLayers.Style({
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
function getMercatorExtent(geoExtent){
	var lbPt = new OpenLayers.Geometry.Point(geoExtent.WestBound, geoExtent.SouthBound);
	var lbMerc = OpenLayers.Layer.SphericalMercator.forwardMercator(lbPt.x, lbPt.y);
	var rtPt = new OpenLayers.Geometry.Point(geoExtent.EastBound, geoExtent.NorthBound);
	var rtMerc = OpenLayers.Layer.SphericalMercator.forwardMercator(rtPt.x, rtPt.y);
	return new OpenLayers.Bounds(lbMerc.lon, lbMerc.lat, rtMerc.lon, rtMerc.lat);
}

function getGeographicalExtent(mercExtent){
	var lbPt = new OpenLayers.Geometry.Point(mercExtent.left, mercExtent.bottom);
	var lbGeo = OpenLayers.Layer.SphericalMercator.inverseMercator(lbPt.x, lbPt.y);
	var rtPt = new OpenLayers.Geometry.Point(mercExtent.right, mercExtent.top);
	var rtGeo = OpenLayers.Layer.SphericalMercator.inverseMercator(rtPt.x, rtPt.y);
	return new OpenLayers.Bounds(lbGeo.lon, lbGeo.lat, rtGeo.lon, rtGeo.lat);	
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
function getControlDrawBox(){
	var controlDrawBox = new OpenLayers.Control({
		draw: function(){
			this.box = new OpenLayers.Handler.Box(controlDrawBox,{
				"start" : this.start,
				"done" : this.done
			});
			this.box.activate();
		},
		start: function(){
			vector.removeAllFeatures();
		},
		done: function(bounds){
			var lt = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.top));
			var rb = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.bottom));
			var ptLt = new OpenLayers.Geometry.Point(lt.lon, lt.lat);
			var ptRt = new OpenLayers.Geometry.Point(rb.lon, lt.lat);
			var ptRb = new OpenLayers.Geometry.Point(rb.lon, rb.lat);
			var ptLb = new OpenLayers.Geometry.Point(lt.lon, rb.lat);
			var lRing = new OpenLayers.Geometry.LinearRing([ptLt, ptRt, ptRb, ptLb]);
			var bbox = new OpenLayers.Geometry.Polygon([lRing]);
			var featBbox = new OpenLayers.Feature.Vector(bbox);
			vector.addFeatures([featBbox]);
			
			setGeoExtent(getGeographicalExtent(bbox.bounds));
		}
	});
	
	return controlDrawBox;	
}

function getControlModify(){
	var controlModify = new OpenLayers.Control.ModifyFeature(vector, {
		mode: OpenLayers.Control.ModifyFeature.RESIZE | OpenLayers.Control.ModifyFeature.DRAG
	});
	
	return controlModify;
}

function afterFeatModified(evt){
	setGeoExtent(getGeographicalExtent(evt.feature.geometry.bounds));
}

var controlDrawBox;
var controlModify;
function addMapEditorTool(idMapToolbar){
	controlDrawBox = getControlDrawBox();
	controlModify = getControlModify();
	
	$("#map-edit-tool button:first").button({
		icons:{
			primary: "ui-icon-pencil"
		},
		text: false
	}).next().button({
		icons:{
			primary: "ui-icon-plus"
		},
		text: false
	});
	
	var isAddBoxOn, isModifyBoxOn;
	
	$("#add-box").toggle(
		function() {
			isAddBoxOn = true;
			
			if(isModifyBoxOn){$("#modify-box").click();}
			
			map.addControl(controlDrawBox);
			map.controls[0].deactivate();			
			$("#add-box").addClass("ui-state-press");
		}, function() {
			isAddBoxOn = false;
			map.removeControl(controlDrawBox);
			map.controls[0].activate();
			$("#add-box").removeClass("ui-state-press");
		}
	);
	
	$("#modify-box").toggle(
		function() {
			isModifyBoxOn = true;
			
			if(isAddBoxOn){$("#add-box").click();}
			
			map.addControl(controlModify);
			controlModify.activate();			
			$("#modify-box").addClass("ui-state-press");
		}, function() {
			isModifyBoxOn = false;
			controlModify.deactivate();
			map.removeControl(controlModify);
			$("#modify-box").removeClass("ui-state-press");
		}
	);
	
	vector.events.register("afterfeaturemodified", this, afterFeatModified);
}


