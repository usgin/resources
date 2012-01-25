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
        {type: google.maps.MapTypeId.TERRAIN},
        {wrapDateLine: true,
         isBaseLayer: true}
    );
    map.addLayer(gphy);
    
    ///Add a vector layer
	vector = new OpenLayers.Layer.Vector();

	map.addLayer(vector);
	///Add bounding box feature to the vector layer, and zoom to this extent
	///If the bounding box is invalid, zoom to the world extent
	geoExtent = getExtConversion(geoExtent);
    if(geoExtent){
	     if(Math.abs(geoExtent.WestBound) < 180
	    	|| Math.abs(geoExtent.SouthBound) < 180
	    	|| Math.abs(geoExtent.EastBound) < 180
	    	|| Math.abs(geoExtent.NorthBound) < 180
	    	) {
	    	///Identify if the box is crossing the dateline	    	
	    	if(geoExtent.WestBound > geoExtent.EastBound){
				geoExtent.EastBound = 360 + geoExtent.EastBound;	    		
	    	}
		    var extent = getMercatorExtentFromEles(geoExtent);
		    addBoundsGeometry(map, vector, extent);
		    map.zoomToExtent(extent);	
	    }else{
	    	map.zoomToMaxExtent();
	    }   	
    }

}

function getExtConversion(geoExtent){
	geoExtent.EastBound = parseFloat(geoExtent.EastBound);
	geoExtent.WestBound = parseFloat(geoExtent.WestBound);
	geoExtent.SouthBound = parseFloat(geoExtent.SouthBound);
	geoExtent.NorthBound = parseFloat(geoExtent.NorthBound);
	return geoExtent;
}

///Return the spherical mercator extent
///Parameters:
////geoExtent - the WGS84 geographic extent
function getMercatorExtentFromEles(extent){
	var newExtent = getMercatorExtent(new OpenLayers.Bounds(extent.WestBound, extent.SouthBound, extent.EastBound, extent.NorthBound));
	return newExtent;
}

function getMercatorExtent(geoExtent){
	var lbPt = new OpenLayers.Geometry.Point(geoExtent.left, geoExtent.bottom);
	var lbMerc = OpenLayers.Layer.SphericalMercator.forwardMercator(lbPt.x, lbPt.y);
	var rtPt = new OpenLayers.Geometry.Point(geoExtent.right, geoExtent.top);
	var rtMerc = OpenLayers.Layer.SphericalMercator.forwardMercator(rtPt.x, rtPt.y);
	return new OpenLayers.Bounds(lbMerc.lon, lbMerc.lat, rtMerc.lon, rtMerc.lat);	
}

///Return the wgs84 geographic extent
///Parameters:
////mercExtent - the spherical mercator extent
function getGeographicExtent(mercExtent){
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
var geoExt;
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
			///Convert pixel values into map coordinates
			var lt = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.top));
			var rb = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.bottom));
		
			///Get the bounding box
			var bbox = new OpenLayers.Bounds(lt.lon, rb.lat, rb.lon, lt.lat);
			var bboxShown = bbox; ///The extent shown in the page
			///Convert the mercator bounding box into the geographic bounding box
			geoExt = getGeographicExtent(bbox); 
			
			///Identify if the geometry is crossing the dateline
			///If it is, change the left and right value 
			if(geoExt.left > geoExt.right){				
				var left = geoExt.left ;
				var right = 360 + geoExt.right;

				geoExt.left = left;
				geoExt.right = right;
				
				bbox = getMercatorExtent(geoExt); ///Get the bounding box with mecator projection			
			}

			var featBbox = new OpenLayers.Feature.Vector(bbox.toGeometry());
			vector.addFeatures([featBbox]);
			
			///Display the geographic extent on the right panel
			setGeoExtent(getGeographicExtent(bboxShown));
			///Disable the "Add bbox" button
			$("#add-box").click();
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
	var bounds = getGeographicExtent(evt.feature.geometry.bounds);	
	bounds.left = getWrapCoordinate(bounds.left);
	bounds.right = getWrapCoordinate(bounds.right);
	setGeoExtent(bounds);
}

///Wrap coordinate into [-180, 180]
function getWrapCoordinate(geoCoor){
	if(geoCoor < -180){
		return 360 + geoCoor;
	}else if(geoCoor > 180){
		return geoCoor - 360;
	}else{
		return geoCoor;
	}
}


function addMapEditorTool(idMapToolbar){
	var controlDrawBox = getControlDrawBox();
	var controlModify = getControlModify();
	
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


