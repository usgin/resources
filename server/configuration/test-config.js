var utils = require("./utils.js");

for (var e in utils.examples) {
	console.log(">>>>>" + e + "<<<<<");
	console.log(JSON.stringify(utils.examples[e]));
}