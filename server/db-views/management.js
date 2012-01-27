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
			
			distNames = {}, dists = objGet(doc, "Distributors", []);
			for (d in dists) {
				if (dists[d].hasOwnProperty("Name")) { distNames[dists[d].Name] = ""; }
				if (dists[d].hasOwnProperty("OrganizationName")) { distNames[dists[d].OrganizationName] = ""; }
			}
			
			result = {
				"ESRI Service": false,
				"WMS Service": false,
				"WFS Service": false,
				"Doc Repository": false,
				"Links have Distributors": true,
				"In a Collection": objGet(doc, "Collections", []).length > 0 ? true : false,
				"ESRI URL": []
			};

			docLinks = objGet(doc, "Links", []);			
			for (d in docLinks) {
				if (docLinks[d].hasOwnProperty("Distributor")) {
					if (!(docLinks[d].Distributor in distNames)) { result["Links have Distributors"] = false; }
				} else { result["Links have Distributors"] = false; }
				
				serviceType = objGet(docLinks[d], "ServiceType", "File").toUpperCase();
				url = objGet(docLinks[d], "URL", "");
				switch (serviceType) {
				case "ESRI":
					result["ESRI Service"] = true;
					result["ESRI URL"].push(url);
					break;
				case "OGC:WMS":
					result["WMS Service"] = true;
					break;
				case "OGC:WFS":
					result["WFS Service"] = true;
					break;
				case "FILE":
					if (url.indexOf("/dlio/") != -1) { result["Doc Repository"] = true; }
					break;
				default:
					break;					
				}
			}
			
			result["Metadata Edit URL"] = "http://metadata.usgin.org/resource/" + doc._id;
			
			//key = [objGet(doc, "Published", false) ? "Published" : "Unpublished", objGet(doc, "Title", "No Title") ];
			key = doc._id;
			
			emit(key, result);
		}
	}
};