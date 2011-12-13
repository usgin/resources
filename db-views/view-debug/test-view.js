var xmlParser = require("xml2json"),
fs = require("fs"),
thisView, viewFunction, result, inputData, outputRoutine;

// Get arguments
var filename = process.argv[2], viewname = process.argv[3];

// Open the file
//var curDir = process.cwd();
var filepath = __dirname + "/test-files/" + filename;
fs.readFile(filepath, function(err, data) {
	if (err) throw err;
	else {
		
		if (viewname.match(/input/)) {
			inputData = xmlParser.toJson(data, { object: true, reversible: true });
			thisView = require("../inputs/" + viewname + ".js").views;
			outputRoutine = function(output) {
				console.log(JSON.stringify(output));
			};
		} else if (viewname.match(/output/)) {
			inputData = JSON.parse(data);
			thisView = require("../outputs/" + viewname + ".js").views;
			outputRoutine = function(output, outputFormat) {
				if (outputFormat == "geojson") { console.log(JSON.stringify(output)); return; }
 				else { console.log(xmlParser.toXml(output)); return; }
			};
		} else {
			console.log("The view name given was invalid."); return;
		}
			
		// Get the map function and the outputFormat
		for (var format in thisView) {
			viewFunction = thisView[format].map || function(input) { console.log("Map function for " + viewname + "was not found."); return; };
		}
		
		try {		
/*
 *  -----------------------------------------------------------------------------------------------
 *  PUT A BREAKPOINT ON THE NEXT LINE AND STEP IN IF YOU WANT TO DEBUG THE VIEW FUNCTION
 *  -----------------------------------------------------------------------------------------------
 */				
			result = viewFunction(inputData);
			outputRoutine(result, format);
			
		} catch(err) {
			throw err;
			return;
		}
	}
});
