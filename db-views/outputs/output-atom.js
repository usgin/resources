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
			
			
			///Loop each link
			atom.setProperty("entry", []);
			
			///Define the array by service types
			var classifiedLinksArray = new Array();
			
			classifiedLinksArray["OGC.WMS"] = new Array();
			classifiedLinksArray["OGC.WFS"] = new Array();
			classifiedLinksArray["OGC.ESRI"] = new Array();
			classifiedLinksArray["OTHER"] = new Array();
			
			for(var l in doc.Links){
				var thisLinkType = doc.Links[l].Type;
				var thisLink = doc.Links[l].URL;
				switch (thisLinkType) {
					case "OGC.WMS":
						classifiedLinksArray["OGC.WMS"].push(thisLink);
						break;
					case "OGC.WFS":
						classifiedLinksArray["OGC.WFS"].push(thisLink);
						break;
					case "OGC.ESRI":
						classifiedLinksArray["OGC.ESRI"].push(thisLink);
						break;
					default:
						classifiedLinksArray["OTHER"].push(thisLink);
						break;		
				}
			}
			///
			iEntry = 0;
			for(var cl in classifiedLinksArray){
				if(classifiedLinksArray[cl].length > 0){
					thisEntryPath = "entry." + iEntry + ".";
					iEntry ++;				
					///Namespaces
					atom.setProperty(thisEntryPath + "xmlns", "http://www.w3.org/2005/Atom");
					atom.setProperty(thisEntryPath + "xmlns:georss", "http://www.georss.org/georss");
					atom.setProperty(thisEntryPath + "xmlns:opensearch", "http://a9.com/-/spec/opensearch/1.1/");
					atom.setProperty(thisEntryPath + "xmlns:scast", "http://sciflo.jpl.nasa.gov/serviceCasting/2009v1");
					
					///Entry
					atom.setProperty(thisEntryPath + "title.$t", objGet(doc, "Title", "No title given"));
					
					///Id element
					atom.setProperty(thisEntryPath + "id.$t", doc._id + "." + cl);
					
					///Author elements
					atom.setProperty(thisEntryPath + "author", []);
					theAuthors = objGet(doc, "Authors", [{ Name: "No Author Given" }]);
					for(var a in theAuthors) {
						thisAuthor = theAuthors[a];
						thisPath = thisEntryPath + "author." + a;
						atom.setProperty(thisPath + ".name.$t", objGet(thisAuthor, "Name", ""));
						atom.setProperty(thisPath + ".contactInformation.phone.$t", objGet(thisAuthor, "ContactInformation.Phone", ""));
						atom.setProperty(thisPath + ".contactInformation.email.$t", objGet(thisAuthor, "ContactInformation.Email", ""));
						atom.setProperty(thisPath + ".contactInformation.address.street.$t", objGet(thisAuthor, "ContactInformation.Address.Street", ""));
						atom.setProperty(thisPath + ".contactInformation.address.city.$t", objGet(thisAuthor, "ContactInformation.Address.City", ""));
						atom.setProperty(thisPath + ".contactInformation.address.state.$t", objGet(thisAuthor, "ContactInformation.Address.State", ""));
						atom.setProperty(thisPath + ".contactInformation.address.zip.$t", objGet(thisAuthor, "ContactInformation.Address.Zip", ""));	
					}				
					
					///Link
					thisLinkArray = classifiedLinksArray[cl];
					
					if(cl != "OTHER"){
						atom.setProperty(thisEntryPath + "scast:serviceSemantics.$t", cl);
						atom.setProperty(thisEntryPath + "scast:serviceProtocol.$t", "HTTP");
						
						atom.setProperty(thisEntryPath + "link", []);
						
						for(iLink = 0; iLink < thisLinkArray.length; iLink ++){
							if(iLink == 0){
								///Define 'alternate' link
								///This is the 1st link
								atom.setProperty(thisEntryPath + "link.0.rel", "alternate");
								atom.setProperty(thisEntryPath + "link.0.href", thisLinkArray[iLink]);
								///Define 'interfaceDescription' link
								///This is the 2rd link
								atom.setProperty(thisEntryPath + "link.1.rel", "scast:interfaceDescription");
								atom.setProperty(thisEntryPath + "link.1.type", "application/xml");
								atom.setProperty(thisEntryPath + "link.1.href", thisLinkArray[iLink]);							
							}else{
								iiLink = iLink + 1; ///Repeated links begin at the 3rd link
								atom.setProperty(thisEntryPath + "link." + iiLink.toString() + ".href", thisLinkArray[iLink]);
							}
						}						
					}else{
						atom.setProperty(thisEntryPath + "link", []);
						for(iLink = 0; iLink < thisLinkArray.length; iLink ++){
							atom.setProperty(thisEntryPath + "link." + iLink.toString() + ".href", thisLinkArray[iLink]);
						}
					}
					///
					
					///Date
					atom.setProperty(thisEntryPath + "updated.$t", doc.ModifiedDate);
					
					///Summary
					atom.setProperty(thisEntryPath + "summary.$t", objGet(doc, "Description", "No description found"));			
					
					///Bounding box
					n = objGet(doc, "GeographicExtent.NorthBound", 89);
					s = objGet(doc, "GeographicExtent.SouthBound", -89);
					e = objGet(doc, "GeographicExtent.EastBound", 179);
					w = objGet(doc, "GeographicExtent.WestBound", -179);
					atom.setProperty(thisEntryPath + "georss:box.$t", [w, s, e, n].join(" "));					
				}
			}			
			emit(doc._id, atom);
		}
	}
			
};

