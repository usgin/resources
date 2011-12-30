var exports = module.exports;

exports.views = {
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
				
				geojson = {
					setProperty: function(propName, value) {
						obj = this;
						props = propName.split(".");
						for (p in props) {
							if (obj.hasOwnProperty(props[p])) {
								obj = obj[props[p]];
							} else {
								if (parseInt(p) + 1 == props.length) {
									obj[props[p]] = value;
								} else {
									obj[props[p]] = {};
									obj = obj[props[p]];
								}
							}
						}
					}
				};
				
				geojson.setProperty("id", doc._id);
				geojson.setProperty("type", "Feature");
				geojson.setProperty("properties.Title", objGet(doc, "Title", "No Title Given"));
				geojson.setProperty("properties.Description", objGet(doc, "Description", "No Description Given"));

				geojson.setProperty("properties.Authors", []);
				for (var a in doc.Authors) {
					thisLookup = "properties.Authors." + a + ".";
					thisAuthor = doc.Authors[a];
					geojson.setProperty(thisLookup + "Name", objGet(thisAuthor, "Name", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Phone", objGet(thisAuthor, "ContactInformation.Phone", ""));
					geojson.setProperty(thisLookup + "ContactInformation.email", objGet(thisAuthor, "ContactInformation.email", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Address.Street", objGet(thisAuthor, "ContactInformation.Address.Street", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Address.City", objGet(thisAuthor, "ContactInformation.Address.City", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Address.State", objGet(thisAuthor, "ContactInformation.Address.State", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Address.Zip", objGet(thisAuthor, "ContactInformation.Address.Zip", ""));
				}

				geojson.setProperty("properties.PublicationDate", objGet(doc, "PublicationDate", "No Publication Date Given"));

				geojson.setProperty("properties.Keywords", []);
				for (var k in doc.Keywords) {
					thisKeyword = doc.Keywords[k];
					if (typeof(thisKeyword == "string")) {
						geojson.setProperty("properties.Keywords." + k, thisKeyword);
					}
				}
				
				geojson.setProperty("properties.Distributors", []);
				for (var d in doc.Distributors) {
					thisLookup = "properties.Distributors." + d + ".";
					thisDist = doc.Distributors[d];
					geojson.setProperty(thisLookup + "Name", objGet(thisDist, "Name", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Phone", objGet(thisDist, "ContactInformation.Phone", ""));
					geojson.setProperty(thisLookup + "ContactInformation.email", objGet(thisDist, "ContactInformation.email", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Address.Street", objGet(thisDist, "ContactInformation.Address.Street", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Address.City", objGet(thisDist, "ContactInformation.Address.City", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Address.State", objGet(thisDist, "ContactInformation.Address.State", ""));
					geojson.setProperty(thisLookup + "ContactInformation.Address.Zip", objGet(thisDist, "ContactInformation.Address.Zip", ""));	
				}
				
				geojson.setProperty("properties.Links", objGet(doc, "Links", {}));
				
				geojson.setProperty("properties.ModifiedDate", objGet(doc, "ModifiedDate", ""));
				
				n = objGet(doc, "GeographicExtent.NorthBound", 89);
				s = objGet(doc, "GeographicExtent.SouthBound", -89);
				e = objGet(doc, "GeographicExtent.EastBound", 179);
				w = objGet(doc, "GeographicExtent.WestBound", -179);

				geojson.setProperty("bbox", [w, s, e, n]);
				geojson.setProperty("geometry.type", "polygon");
				geojson.setProperty("geometry.coordinates", []);
				geojson.setProperty("geometry.coordinates.0", [w, n]);
				geojson.setProperty("geometry.coordinates.1", [w, s]);
				geojson.setProperty("geometry.coordinates.2", [e, s]);
				geojson.setProperty("geometry.coordinates.3", [e, n]);
				geojson.setProperty("geometry.coordinates.4", [w, n]);
				geojson.setProperty("crs.type", "name");
				geojson.setProperty("crs.properties.name", "urn:ogc:def:crs:OGC:1.3:CRS84");

			  	emit(doc._id, geojson);
				//return geojson;
			}
		}	
};