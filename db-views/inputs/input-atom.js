var exports = module.exports;

exports.views = {
	atom: {
		map: function(doc) {
			objGet = function(obj, propName, defVal) {
				if (!obj) { return defVal; }
				propParts = propName.split(".");
				for (var i = 0; i < propParts.length; i ++) {
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
			
			///Delete the used property from the given object
			extra = doc; 
			
			extra.delProperty = function(propName){
					obj = this;
					props = propName.split(".");

					for(var i = 0; i < props.length; i ++){					
						if(i == props.length - 1){
							delete obj[props[i]]; ///Delete the used property
							if(props.slice(0, props.length - 1).length > 0){
								this.delEmptyProperty(props.slice(0, props.length - 1));
							}							
						}else{
							obj = obj[props[i]];
						}
					}					
			};
			
			///Delete empty branch
			extra.delEmptyProperty = function(props){
				obj = this;
				for(var i = 0; i < props.length; i ++){
					if(i == props.length - 1){
						if(obj[props[i]].toSource() === "({})"){ ///If this property is empty
							delete obj[props[i]];
							if(props.slice(0, props.length - 1).length > 0){
								this.delEmptyProperty(props.slice(0, props.length - 1));
							}							
						}
					}else{
						obj = obj[props[i]];
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
			///Set title
			atom.setProperty("Title", objGet(doc, "title.$t", "No title found"));
			///Set summary
			atom.setProperty("Description", objGet(doc, "summary.$t", "No summary found"));
			///Set author infomation
			if(doc.author){
				if(doc.author.constructor.toString().indexOf("Array") != -1){
					atom.setProperty("Author", []);
					for(a in doc.author){
						thisAuthorPath = "Author." + a + ".";
						atom.setProperty(thisAuthorPath + "Name", objGet(doc, "author." + a + ".name.$t", "No name found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Phone", objGet(doc, "author." + a + ".contactInformation.phone.$t", "No phone found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Email", objGet(doc, "author." + a + ".contactInformation.email.$t", "No email found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.Street", objGet(doc, "author." + a + ".contactInformation.address.street.$t", "No address found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.City", objGet(doc, "author." + a + ".contactInformation.address.city.$t", "No city found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.State", objGet(doc, "author." + a + ".contactInformation.address.state.$t", "No state found"));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.Zip", objGet(doc, "author." + a + ".contactInformation.address.zip.$t", "No zip found"));
					}					
				}else{
					atom.setProperty("Author.Name", objGet(doc, "author.name", "No name found"));
					atom.setProperty("Author.ContactInformation.Phone", objGet(doc, "author.contactInformation.phone.$t", "No phone found"));
					atom.setProperty("Author.ContactInformation.Email", objGet(doc, "author.contactInformation.email.$t", "No email found"));
					atom.setProperty("Author.ContactInformation.Address.Street", objGet(doc, "author.contactInformation.address.street.$t", "No address found"));
					atom.setProperty("Author.ContactInformation.Address.City", objGet(doc, "author.contactInformation.address.city.$t", "No city found"));
					atom.setProperty("Author.ContactInformation.Address.State", objGet(doc, "author.contactInformation.address.state.$t", "No state found"));
					atom.setProperty("Author.ContactInformation.Address.Zip", objGet(doc, "author.contactInformation.address.zip.$t", "No zip found"));
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
			objScastSemantics = objGet(doc, "scast:serviceSemantics.$t", "");
			atom.setProperty("Links",[]);
			if(objScastSemantics && objLinks) { ///This is an atom feed with service casting namespace
					atom.setProperty("Links.0.Type.$t", objScastSemantics);
					for(l in objLinks){
						if(doc["link"][l]["rel"] == "scast:interfaceDescription"
							|| doc["link"][l]["rel"] == "scast:serviceInterface"
							){
							atom.setProperty("Links.0.URL.$t", objGet(doc, "link." + l + ".href", "No URL found"));
							break;
						}
					}
			} else if(objLinks){ ///This is an atom feed without service casting namespace
					var linkSequence = 0;
					if(objLinks.constructor.toString().indexOf("Array") != -1){///ObjLinks is an array
						for(l in objLinks){
							thisUrl = objLinks[l]["href"];
							if(thisUrl){
								if(parseUrl(thisUrl, linkSequence)){
									linkSequence ++;
									extra.delProperty("link." + l + ".href");
								}
							}
						}
					}else{///ObjLinks is not an array
						thisUrl = objLinks["href"];
						if(thisUrl){
							if(parseUrl(thisUrl, linkSequence)){
								extra.delProperty("link.href");
							}
						}
					}
			}
			
			atom.setProperty("HarvestInformation.ExtraContent", extra);

			emit(doc._id, atom);

			///Identify the type of link if service casting is not provided
			///Parameters: thisUrl - the link to be parsed; i - the link sequence in database
			function parseUrl(thisUrl, i) {
				var isNext = false;
				if(thisUrl.search(/getcapabilities/i) != -1) {
					if(thisUrl.search(/wms/i) != -1) {
						///WMS service
						isNext = setLinkProp("OGC.WMS", thisUrl, i)						
					} else if(thisUrl.search(/wfs/i) != -1) {
						///WFS service
						isNext = setLinkProp("OGC.WFS", thisUrl, i)
					} else if(thisUrl.search(/csw/i) != -1) {
						///CSW service
						isNext = setLinkProp("OGC.CSW", thisUrl, i);
					}
				}else if(thisUrl.search(/download/i) != -1) {
					///Download service
					isNext = setLinkProp("Download", thisUrl, i);
				}
				
				return isNext; ///If we need to move to the next link
			}
			
			function setLinkProp(type, url, sequence){
				atom.setProperty("Links." + sequence + ".Type", type);
				atom.setProperty("Links." + sequence + ".URL", url);
				return true;
			}
			
		}
	}
};
