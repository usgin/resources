var exports = module.exports;

_stdFormatsHarvestable = {
	iso: "USGIN-ISO 19139",
	//fgdc: "FGDC XML",
	//wms: "WMS Capabilities",
	//wfs: "WFS Capabilities",
	//esri: "ESRI Capabilities",
	//csw: "CSW GetRecords Response",
	//aasg: "AASG Geothermal Metadata Template"	
};

_inputViews = {};

for (var f in _stdFormatsHarvestable) {
	var theseViews = require("./input-" + f + ".js").views;
	for (var v in theseViews) {
		_inputViews[v] = theseViews[v];
	}
}

exports.stdFormatsHarvestable = _stdFormatsHarvestable;
exports.views = _inputViews;