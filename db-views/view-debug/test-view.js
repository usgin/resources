xmlParser = require("xml2json"),
fs = require("fs");

// Get arguments
var filename = process.argv[2], viewname = process.argv[3];

// Open the file
//var curDir = process.cwd();
var filepath = __dirname + "/test-files/" + filename;
fs.readFile(filepath, function(err, data) {
	if (err) throw err;
	else {
		
		if (viewname.match(/input/)) {
			// Convert XML to JSON
			var jsonData = xmlParser.toJson(data, { object: true, reversible: true });
			
			// Find the input view
			var thisView = require("../inputs/" + viewname + ".js").views;
			
			// Get the map function
			for (var format in thisView) {
				var viewFunction = thisView[format].map || function(input) { console.log("Map function for " + viewname + "was not found."); return; };
			}
			
			try {
				// Run the conversion
				
/*
 *  --------------------------------------------------------------------------------------
 *  PUT A BREAKPOINT ON THE NEXT LINE AND STEP IN IF YOU WANT TO DEBUG THE VIEW FUNCTION
 *  --------------------------------------------------------------------------------------
 */				
				var result = viewFunction(jsonData);
				if (result) {
					console.log(JSON.stringify(result));
					return;
				} else {
					console.log("The view returned no data. Did you remember to comment out the emit line and replace it with return doc;?");
					return;
				}
				
			} catch(err) {
				throw err;
				return;
			}
		} else if (viewname.match(/output/)) {
			console.log("Does not yet test output views."); return;
		} else {
			console.log("The view name given was invalid."); return;
		}
	}
});
