var exports = module.exports;

exports.views = {
	atom: {
		map: function(doc) {
			objGet = function(obj, propName, defVal) {
				if (!obj) { return defVal; }
				propParts = propName.split(".");
				for (i = 0; i < propParts.length; i ++) {
					if (obj.hasOwnProperty(propParts[i])) {
						obj = obj[propParts[i]];
						if (i == propParts.length - 1) { 
							extra.delProperty(propName);
							return obj; 
						}
					} else {
						return defVal;
					}
				}
			};
			
			///Delete the property from the given object
			extra = doc; 
			
			extra.delProperty = function(propName){
					obj = this;
					props = propName.split(".");

					for(i = 0; i < props.length; i ++){					
						if(i == props.length - 1){
							delete obj[props[i]];
						}else{
							obj = obj[props[i]];
						}
					}
					
			};
			///
				
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
			/**********************************************************************************************/
			///Set title
			atom.setProperty("Title", objGet(doc, "title", "No title found"));
			///Set summary
			atom.setProperty("Description", objGet(doc, "summary", "No summary found"));
			///Set author infomation
			if(doc.author){
				if(doc.author.constructor.toString().indexOf("Array") != -1){
					atom.setProperty("Author", []);
					for(a in doc.author){
						thisAuthorPath = "Author." + a + ".";
						atom.setProperty(thisAuthorPath + "Name", objGet(doc, "author." + a + ".name", "No name found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Phone", objGet(doc, "author." + a + ".contactInformation.phone", "No phone found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Email", objGet(doc, "author." + a + ".contactInformation.email", "No email found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.Street", objGet(doc, "author." + a + ".contactInformation.address.street", "No address found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.City", objGet(doc, "author." + a + ".contactInformation.address.city", "No city found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.State", objGet(doc, "author." + a + ".contactInformation.address.state", "No state found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.Zip", objGet(doc, "author." + a + ".contactInformation.address.zip", "No zip found"));
					}					
				}else{
					atom.setProperty("Author.Name", objGet(doc, "author.name", "No name found"));
					atom.setProperty("Author.ContactInformation.Phone", objGet(doc, "author.contactInformation.phone", "No phone found"));
					atom.setProperty("Author.ContactInformation.Email", objGet(doc, "author.contactInformation.email", "No email found"));
					atom.setProperty("Author.ContactInformation.Address.Street", objGet(doc, "author.contactInformation.address.street", "No address found"));
					atom.setProperty("Author.ContactInformation.Address.City", objGet(doc, "author.contactInformation.address.city", "No city found"));
					atom.setProperty("Author.ContactInformation.Address.State", objGet(doc, "author.contactInformation.address.state", "No state found"));
					atom.setProperty("Author.ContactInformation.Address.Zip", objGet(doc, "author.contactInformation.address.zip", "No zip found"));
				}

			}
			///Set geographic extent
			objGeoExt = objGet(doc, "georss:box", "");
			if(objGeoExt){
				rGeoExt = objGeoExt.toString().split(" ");
				if(rGeoExt.length == 4){
					atom.setProperty("GeographicExtent.WestBound", rGeoExt[0]);
					atom.setProperty("GeographicExtent.SouthBound", rGeoExt[1]);
					atom.setProperty("GeographicExtent.EastBound", rGeoExt[2]);
					atom.setProperty("GeographicExtent.NorthBound", rGeoExt[3]);
				}
			}
			

			///Identify if this is a scast atom feed
			objLinks = doc.link;
			objScastSemantics = objGet(doc, "scast:serviceSemantics", "");
			atom.setProperty("Links",[]);
			if(objScastSemantics && objLinks) { ///This is an atom feed with service casting namespace
					atom.setProperty("Links.0.Type", objScastSemantics);
					for(l in objLinks){
						if(objGet(doc, "link." + l + ".rel", "") == "scast:interfaceDescription"
							|| objGet(doc, "link." + l + ".rel", "") == "scast:serviceInterface"
							){
							atom.setProperty("Links.0.URL", objGet(doc, "link." + l + ".href", "No URL found"));
							break;
						}
					}
			} else if(objLinks){ ///This is an atom feed without service casting namespace
					linkSequence = 0;
					if(objLinks.constructor.toString().indexOf("Array") != -1){///ObjLinks is an array
						for(l in objLinks){
							thisUrl = objGet(doc, "link." + l + ".href", "");
							if(thisUrl){
								linkSequence = parseUrl(thisUrl, linkSequence);
							}
						}
					}else{///ObjLinks is not an array
						thisUrl = objGet(doc, "link.href", "");
						if(thisUrl){
							linkSequence = parseUrl(thisUrl, linkSequence);
						}
					}
			}
			
			atom.Extra = extra;

			emit(doc._id, atom);

			///Identify the type of link if service casting is not provided
			///Parameters: thisUrl - the link to be parsed; i - the link sequence in database
			function parseUrl(thisUrl, i) {
				if(thisUrl.search(/getcapabilities/i) != -1) {
					if(thisUrl.search(/wms/i) != -1) {
						///WMS service
						setLinkProp("OGC.WMS", thisUrl, i ++)						
					} else if(thisUrl.search(/wfs/i) != -1) {
						///WFS service
						setLinkProp("OGC.WFS", thisUrl, i ++)
					} else if(thisUrl.search(/csw/i) != -1) {
						///CSW service
						setLinkProp("OGC.CSW", thisUrl, i ++);
					}
				}else if(thisUrl.search(/download/i) != -1) {
					///Download service
					setLinkProp("Download", thisUrl, i ++);
				}
				
				return i; ///Return the sequence for the next link which should be stored in database
			}
			
			function setLinkProp(type, url, sequence){
				atom.setProperty("Links." + sequence + ".Type", type);
				atom.setProperty("Links." + sequence + ".URL", url);
			}
			
		}
	}
};
