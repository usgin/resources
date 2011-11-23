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
			/**********************************************************************************************/
			///Create an extra object including the info not needed
			var extra = doc;
			///Set title
			atom.setProperty("Title", objGet(doc, "title", "No title found"));
			///Set summary
			atom.setProperty("Description", objGet(doc, "summary", "No summary found"));
			///Set author infomation
			if(doc.author){
				thisAuthors = doc.author;
				if(thisAuthors.constructor.toString().indexOf("Array") != -1){
					atom.setProperty("Author", []);
					for(a in thisAuthors){
						thisAuthor = thisAuthors[a];
						thisAuthorPath = "Author." + a + ".";
						atom.setProperty(thisAuthorPath + "Name", objGet(thisAuthor, "name", "No name found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Phone", objGet(thisAuthor, "contactInformation.phone", "No phone found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Email", objGet(thisAuthor, "contactInformation.email", "No email found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.Street", objGet(thisAuthor, "contactInformation.address.street", "No address found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.City", objGet(thisAuthor, "contactInformation.address.city", "No city found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.State", objGet(thisAuthor, "contactInformation.address.state", "No state found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.Zip", objGet(thisAuthor, "contactInformation.address.zip", "No zip found"));
					}					
				}else{
					atom.setProperty("Author.Name", objGet(thisAuthors, "name", "No name found"));
					atom.setProperty("Author.ContactInformation.Phone", objGet(thisAuthors, "contactInformation.phone", "No phone found"));
					atom.setProperty("Author.ContactInformation.Email", objGet(thisAuthors, "contactInformation.email", "No email found"));
					atom.setProperty("Author.ContactInformation.Address.Street", objGet(thisAuthors, "contactInformation.address.street", "No address found"));
					atom.setProperty("Author.ContactInformation.Address.City", objGet(thisAuthors, "contactInformation.address.city", "No city found"));
					atom.setProperty("Author.ContactInformation.Address.State", objGet(thisAuthors, "contactInformation.address.state", "No state found"));
					atom.setProperty("Author.ContactInformation.Address.Zip", objGet(thisAuthors, "contactInformation.address.zip", "No zip found"));
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
			objLinks = objGet(doc, "link", "");
			objScastSemantics = objGet(doc, "scast:serviceSemantics", "");
			atom.setProperty("Links",[]);
			if(objScastSemantics && objLinks) { ///This is an atom feed with service casting namespace
					atom.setProperty("Links.0.Type", objScastSemantics);
					for(l in objLinks){
						if(objGet(objLinks[l], "rel", "") == "scast:interfaceDescription"
							|| objGet(objLinks[l], "rel", "") == "scast:serviceInterface"
							){
							atom.setProperty("Links.0.URL", objGet(objLinks[l], "href", "No URL found"));
							break;
						}
					}
			} else if(objLinks){ ///This is an atom feed without service casting namespace
					linkSequence = 0;
					if(objLinks.constructor.toString().indexOf("Array") != -1){///ObjLinks is an array
						for(l in objLinks){
							thisUrl = objGet(objLinks[l], "href", "");
							if(thisUrl){
								linkSequence = parseUrl(thisUrl, linkSequence);
							}
						}
					}else{///ObjLinks is not an array
						thisUrl = objGet(objLinks, "href", "");
						if(thisUrl){
							linkSequence = parseUrl(thisUrl, linkSequence);
						}
					}
			}

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
