var exports = module.exports;

_stdFormatsAvailable = {
	"iso.xml": "USGIN-ISO 19139",
	//"fgdc.xml": "FGDC XML",
	geojson: "GeoJSON",
	"atom.xml": "Atom Feed",
	html: "HTML"
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
