var exports = module.exports;

exports.views = {
	atom: {
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
			
			atom = {
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
			
			// Namespaces
			//atom.setProperty("feed.xmlns", "http://www.w3.org/2005/Atom");
			//atom.setProperty("feed.xmlns:georss", "http://www.georss.org/georss");
			//atom.setProperty("feed.xmlns:opensearch", "http://a9.com/-/spec/opensearch/1.1/");
			
			// Entry
			atom.setProperty("entry.title.$t", objGet(doc, "Title", "No title given"));
			
			// Id element
			atom.setProperty("entry.id.$t", doc._id);
			
			// Author elements
			if(doc.Authors != null){
				for(var a in doc.Authors){
					thisAuthor = doc.Authors[a];
					thisPath = "entry.authors." + a + ".";
					atom.setProperty(thisPath + ".name.$t", objGet(thisAuthor, "Name", ""));
					atom.setProperty(thisPath + ".contactInformation.phone.$t", objGet(thisAuthor, "ContactInformation.Phone", ""));
					atom.setProperty(thisPath + ".contactInformation.email.$t", objGet(thisAuthor, "ContactInformation.Email", ""));
					atom.setProperty(thisPath + ".contactInformation.address.street.$t", objGet(thisAuthor, "ContactInformation.Address.Street", ""));
					atom.setProperty(thisPath + ".contactInformation.address.city.$t", objGet(thisAuthor, "ContactInformation.Address.City", ""));
					atom.setProperty(thisPath + ".contactInformation.address.state.$t", objGet(thisAuthor, "ContactInformation.Address.State", ""));
					atom.setProperty(thisPath + ".contactInformation.address.zip.$t", objGet(thisAuthor, "ContactInformation.Address.Zip", ""));	
				}
			}
			else{
				atom.setProperty("entry.author.$t", "");
			}
			
			// Link list
			
			for(var l in doc.Links){
				thisLink = doc.Links[l];
				atom.setProperty("entry.links." + l + ".href", objGet(thisLink, "URL", "Link not found"));
			}
			
			// Date
			atom.setProperty("entry.updated.$t", doc.ModifiedDate);
			
			// Summary
			atom.setProperty("entry.summary.$t", objGet(doc, "Description", "Description not found"));			
			
			// Bounding box
			n = objGet(doc, "GeographicExtent.NorthBound", 89);
			s = objGet(doc, "GeographicExtent.SouthBound", -89);
			e = objGet(doc, "GeographicExtent.EastBound", 179);
			w = objGet(doc, "GeographicExtent.WestBound", -179);
			atom.setProperty("entry.georss:box.$t", [w, s, e, n]);
			
			emit(doc._id, atom);
		}
	}	
};