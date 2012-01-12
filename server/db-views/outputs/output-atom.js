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
						strValue = strValue.replace(/&(?!(amp;|lt;|gt;|quot;|apos;))/g, "&amp;");
						strValue = strValue.replace(/</g, "&lt;");
						strValue = strValue.replace(/>/g, "&gt;");
						strValue = strValue.replace(/"/g, "&quot;");
						strValue = strValue.replace(/'/g, "&apos;");
					}
				}
				return strValue;
			}
			
			/**********************************************************************************************/
			
			///Namespaces
			atom.setProperty("entry.xmlns", "http://www.w3.org/2005/Atom");
			atom.setProperty("entry.xmlns:georss", "http://www.georss.org/georss");
			atom.setProperty("entry.xmlns:opensearch", "http://a9.com/-/spec/opensearch/1.1/");
			
			///Entry
			atom.setProperty("entry.title.$t", objGet(doc, "Title", "No title given"));
			
			///Id element
			atom.setProperty("entry.id.$t", doc._id);
			
			///Author elements
			atom.setProperty("entry.author", []);
			theAuthors = objGet(doc, "Authors", "");
			if(theAuthors){
				for(var a in theAuthors) {
					thisAuthor = theAuthors[a];
					thisPath ="entry.author." + a;
					atom.setProperty(thisPath + ".name.$t", objGet(thisAuthor, "Name", ""));
					atom.setProperty(thisPath + ".contactInformation.phone.$t", objGet(thisAuthor, "ContactInformation.Phone", ""));
					atom.setProperty(thisPath + ".contactInformation.email.$t", objGet(thisAuthor, "ContactInformation.Email", ""));
					atom.setProperty(thisPath + ".contactInformation.address.street.$t", objGet(thisAuthor, "ContactInformation.Address.Street", ""));
					atom.setProperty(thisPath + ".contactInformation.address.city.$t", objGet(thisAuthor, "ContactInformation.Address.City", ""));
					atom.setProperty(thisPath + ".contactInformation.address.state.$t", objGet(thisAuthor, "ContactInformation.Address.State", ""));
					atom.setProperty(thisPath + ".contactInformation.address.zip.$t", objGet(thisAuthor, "ContactInformation.Address.Zip", ""));	
				}
			}
			
			///Link
			atom.setProperty("entry.link", []);
			
			for (var l in doc.Links || []) {
				thisLinkPath = "entry.link." + l + ".";
				thisLink = doc.Links[l];
				atom.setProperty(thisLinkPath + "href", objGet(thisLink, "URL", ""));
				if (thisLink.hasOwnProperty("ServiceType")) { atom.setProperty(thisLinkPath + "serviceType", objGet(thisLink, "ServiceType", "")); }
				if (thisLink.hasOwnProperty("LayerId")) { atom.setProperty(thisLinkPath + "layerId", objGet(thisLink, "LayerId", "")); }
			}
			
			///Date
			atom.setProperty("entry.updated.$t", doc.ModifiedDate);
			
			///Summary
			atom.setProperty("entry.summary.$t", objGet(doc, "Description", "No description found"));			
			
			///Bounding box
			n = objGet(doc, "GeographicExtent.NorthBound", 89);
			s = objGet(doc, "GeographicExtent.SouthBound", -89);
			e = objGet(doc, "GeographicExtent.EastBound", 179);
			w = objGet(doc, "GeographicExtent.WestBound", -179);
			atom.setProperty("entry.georss:box.$t", [w, s, e, n].join(" "));					
				
			emit(doc._id, atom);
			//return atom;
		}
	}
			
};

