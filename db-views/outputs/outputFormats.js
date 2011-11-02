var exports = module.exports;

_stdFormatsAvailable = {
	iso: "USGIN-ISO 19139",
	//fgdc: "FGDC XML",
	geojson: "GeoJSON",
	atom: "Atom Feed",
	//html: "HTML"
};

_outputViews = {};

for (var f in _stdFormatsAvailable) {
	if (f == "html") { continue; }
	var theseViews = require("./output-" + f + ".js").views;
	for (var v in theseViews) {
		_outputViews[v] = theseViews[v];
	}
}

exports.stdFormatsAvailable = _stdFormatsAvailable;
exports.views = _outputViews;
