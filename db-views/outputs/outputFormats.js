var exports = module.exports;

_stdFormatsAvailable = {
	//iso: "USGIN-ISO 19139",
	//fgdc: "FGDC XML",
	geojson: "GeoJSON",
	//atom: "Atom Feed",
};

_outputViews = {};

for (var f in _stdFormatsAvailable) {
	var theseViews = require("./output-" + f + ".js").views;
	for (var v in theseViews) {
		_outputViews[v] = theseViews[v];
	}
}

exports.stdFormatsAvailable = _stdFormatsAvailable;
exports.views = _outputViews;
