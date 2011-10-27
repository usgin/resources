var exports = module.exports;

exports.view = {
		geojson: {
			map: function(doc) {
				objGet = function(obj, prop, defVal) {
					if (!obj) { return defVal; }
					propParts = prop.split("."), count = 0;
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
				
				geojson = {};
				geojson.id = doc._id;
				geojson.type = "Feature";
				geojson.properties = {};
				geojson.properties.Title = objGet(doc, "Title", "No Title Given");
				geojson.properties.Description = objGet(doc, "Description", "No Description Given");

				geojson.properties.Authors = [];
				for (a in doc.Authors) {
					geojson.properties.Authors[a] = {};
					geojson.properties.Authors[a].Name = objGet(doc.Authors[a], "Name", "");
					geojson.properties.Authors[a].ContactInformation = {};
					geojson.properties.Authors[a].ContactInformation.Phone = objGet(doc.Authors[a], "ContactInformation.Phone", "");
					geojson.properties.Authors[a].ContactInformation.email = objGet(doc.Authors[a], "ContactInformation.email", "");
					geojson.properties.Authors[a].ContactInformation.Address = {};
					geojson.properties.Authors[a].ContactInformation.Address.Street = objGet(doc.Authors[a], "ContactInformation.Address.Street", "");
					geojson.properties.Authors[a].ContactInformation.Address.City = objGet(doc.Authors[a], "ContactInformation.Address.City", "");
					geojson.properties.Authors[a].ContactInformation.Address.State = objGet(doc.Authors[a], "ContactInformation.Address.State", "");
					geojson.properties.Authors[a].ContactInformation.Address.Zip = objGet(doc.Authors[a], "ContactInformation.Address.Zip", "");
				}

				geojson.properties.PublicationDate = objGet(doc, "PublicationDate", "No Publication Date Given");

				geojson.properties.Keywords = [];
				for (k in doc.Keywords) {
					if (typeof(doc.Keywords[k] == "string")) {
						geojson.properties.Keywords.push(doc.Keywords[k]);
					}
				}
				
				geojson.properties.Distributors = [];
				for (var d in doc.Distributors) {
					thisDist = doc.Distributors[d];
					geojson.properties.Distributors[d] = {};
					geojson.properties.Distributors[d].Name = objGet(thisDist, "Name", "");
					geojson.properties.Distributors[d].ContactInformation = {};
					geojson.properties.Distributors[d].ContactInformation.Phone = objGet(thisDist, "ContactInformation.Phone", "");
					geojson.properties.Distributors[d].ContactInformation.email = objGet(thisDist, "ContactInformation.email", "");
					geojson.properties.Distributors[d].ContactInformation.Address = {};
					geojson.properties.Distributors[d].ContactInformation.Address.Street = objGet(thisDist, "ContactInformation.Address.Street", "");
					geojson.properties.Distributors[d].ContactInformation.Address.City = objGet(thisDist, "ContactInformation.Address.City", "");
					geojson.properties.Distributors[d].ContactInformation.Address.State = objGet(thisDist, "ContactInformation.Address.State", "");
					geojson.properties.Distributors[d].ContactInformation.Address.Zip = objGet(thisDist, "ContactInformation.Address.Zip", "");	
				}
				
				geojson.properties.Links = [];
				for (l in doc.Links) {
					geojson.properties.Links[l] = {};
					geojson.properties.Links[l].Type = objGet(doc.Links[l], "Type", "");
					geojson.properties.Links[l].UTL = objGet(doc.Links[l], "URL", "");
				}
				
				geojson.properties.ModifiedDate = objGet(doc, "ModifiedDate", "");
				
				n = objGet(doc, "GeographicExtent.NorthBound", 89);
				s = objGet(doc, "GeographicExtent.SouthBound", -89);
				e = objGet(doc, "GeographicExtent.EastBound", 179);
				w = objGet(doc, "GeographicExtent.WestBound", -179);

				geojson.bbox = [w, s, e, n];
				geojson.geometry = {};
				geojson.geometry.type = "polygon";
				geojson.geometry.coordinates = [];
				geojson.geometry.coordinates.push([w, n]);
				geojson.geometry.coordinates.push([w, s]);
				geojson.geometry.coordinates.push([e, s]);
				geojson.geometry.coordinates.push([e, n]);
				geojson.geometry.coordinates.push([w, n]);
				geojson.crs = {};
				geojson.crs.type = "name";
				geojson.crs.properties = {};
				geojson.crs.properties.name = "urn:ogc:def:crs:OGC:1.3:CRS84";

			  	emit(doc._id, geojson);
			}
		}	
};