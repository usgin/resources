var exports = module.exports;

exports.views = {
	"atom.xml": {
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
								obj[props[p]] = toXmlValidText(value);
								
							} else {
								obj[props[p]] = {};
								obj = obj[props[p]];
							}
						}
					}
				}
			};
			
			///Convert text into valid text for XML docs
			function toXmlValidText(strValue){
				if (strValue) {
					if(strValue.constructor.toString().indexOf("String") != -1){
						strValue = strValue.replace(/&(?!(amp;|lt;|gt;|quot;|apos;|nbsp;))/g, "&amp;");
						strValue = strValue.replace(/</g, "&lt;");
						strValue = strValue.replace(/>/g, "&gt;");
						strValue = strValue.replace(/"/g, "&quot;");
						strValue = strValue.replace(/'/g, "&apos;");
						strValue = strValue.replace(/&nbsp;/g, " ");
					}
				}
				return strValue;
			}
			
			/**********************************************************************************************/			
			
			///Entry
			atom.setProperty("feed.entry.title.$t", objGet(doc, "Title", "No title given"));
			
			///Id element
			atom.setProperty("feed.entry.id.$t", doc._id);
			
			///Author elements
			atom.setProperty("feed.entry.author", []);
			theAuthors = objGet(doc, "Authors", "");
			if(theAuthors){
				for(var a in theAuthors) {
					thisAuthor = theAuthors[a];
					thisPath ="feed.entry.author." + a;
					atom.setProperty(thisPath + ".name.$t", objGet(thisAuthor, "Name", objGet(thisAuthor, "OrganizationName", "")));
					atom.setProperty(thisPath + ".contactInformation.phone.$t", objGet(thisAuthor, "ContactInformation.Phone", ""));
					atom.setProperty(thisPath + ".contactInformation.email.$t", objGet(thisAuthor, "ContactInformation.Email", ""));
					atom.setProperty(thisPath + ".contactInformation.address.street.$t", objGet(thisAuthor, "ContactInformation.Address.Street", ""));
					atom.setProperty(thisPath + ".contactInformation.address.city.$t", objGet(thisAuthor, "ContactInformation.Address.City", ""));
					atom.setProperty(thisPath + ".contactInformation.address.state.$t", objGet(thisAuthor, "ContactInformation.Address.State", ""));
					atom.setProperty(thisPath + ".contactInformation.address.zip.$t", objGet(thisAuthor, "ContactInformation.Address.Zip", ""));	
				}
			}
			
			///Link
			atomLinks = [{ "href": "/resource/" + doc._id + "/html", "rel": "alternate" }];
			
			for (var l in doc.Links || []) {
				thisLink = doc.Links[l];
				atomLink = { "href": objGet(thisLink, "URL", "") };
				if (thisLink.hasOwnProperty("ServiceType")) { atomLink["serviceType"] = objGet(thisLink, "ServiceType", ""); }
				if (thisLink.hasOwnProperty("LayerId")) { atomLink["layerId"] = objGet(thisLink, "LayerId", ""); }
				atomLinks.push(atomLink);
			}
			
			atom.setProperty("feed.entry.link", atomLinks);
			
			///Date
			atom.setProperty("feed.entry.updated.$t", doc.ModifiedDate);
			
			///Summary
			atom.setProperty("feed.entry.summary.$t", objGet(doc, "Description", "No description found"));			
			
			///Bounding box
			n = objGet(doc, "GeographicExtent.NorthBound", 89);
			s = objGet(doc, "GeographicExtent.SouthBound", -89);
			e = objGet(doc, "GeographicExtent.EastBound", 179);
			w = objGet(doc, "GeographicExtent.WestBound", -179);
			atom.setProperty("feed.entry.georss:box.$t", [w, s, e, n].join(" "));					
				
			emit(doc._id, atom);
			//return atom;
		}
	}
			
};

