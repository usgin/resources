var exports = module.exports;

exports.views = {
	summary: {
		map: function(doc) {
			objGet = function(obj, prop, defVal) {
				if (!obj) { return defVal; }
				propParts = prop.split(".");
				count = 0;
				for (p in propParts) {
					if (obj.hasOwnProperty(propParts[p])) {
						obj = obj[propParts[p]];
						count++;
						if (count === propParts.length) { return obj; }
					} else {
						return defVal;
					}
				}
			};
			
			result = {};
			
			result.EditUrl = "http://metadata.usgin.org/resource/" + doc._id;
			
			result.EsriUrl = [];
			result.hasWms = false;
			result.hasWfs = false;
			result.inRepo = false;
			
			docLinks = objGet(doc, "Links", []);			
			for (d in docLinks) {
				serviceType = objGet(docLinks[d], "ServiceType", "File").toUpperCase();
				url = objGet(docLinks[d], "URL", "");
				switch (serviceType) {
				case "ESRI":
					result.EsriUrl.push(url);
					break;
				case "OGC:WMS":
					result.hasWms = true;
					break;
				case "OGC:WFS":
					result.hasWfs = true;
					break;
				case "FILE":
					if (url.indexOf("/dlio/") != -1) { result.inRepo = true; }
					break;
				default:
					break;					
				}
			}
			
			key = [objGet(doc, "Published", false) ? "Published" : "Unpublished", objGet(doc, "Title", "No Title") ];
			
			emit(key, result);
		}
	}
};