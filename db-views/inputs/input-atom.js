var exports = module.exports;

exports.views = {
	atom: {
		map: function(doc) {
			objGet = function(obj, propName, defVal, isDel) {
				if (!obj) { return defVal; }
				propParts = propName.split(".");
				for (var i = 0; i < propParts.length; i ++) {
					if (obj.hasOwnProperty(propParts[i])) {
						obj = obj[propParts[i]];
						if (i == propParts.length - 1) { 
							if(isDel){
								extra.delProperty(propName);
							}
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
			atom.setProperty("Title", objGet(doc, "title.$t", "No title found", true));
			///Set summary
			atom.setProperty("Description", objGet(doc, "summary.$t", "No summary found", true));
			///Set author infomation
			thisAuthor = objGet(doc, "author", "No author found", false);
			if(thisAuthor != "No author found"){
				if(thisAuthor.constructor.toString().indexOf("Array") != -1){
					atom.setProperty("Author", []);
					for(a in thisAuthor){
						thisAuthorPath = "Author." + a + ".";
						atom.setProperty(thisAuthorPath + "Name", objGet(doc, "author." + a + ".name.$t", "No name found", true));
						atom.setProperty(thisAuthorPath + "ContactInformation.Phone", objGet(doc, "author." + a + ".contactInformation.phone.$t", "No phone found", true));
						atom.setProperty(thisAuthorPath + "ContactInformation.Email", objGet(doc, "author." + a + ".contactInformation.email.$t", "No email found", true));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.Street", objGet(doc, "author." + a + ".contactInformation.address.street.$t", "No address found", true));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.City", objGet(doc, "author." + a + ".contactInformation.address.city.$t", "No city found", true));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.State", objGet(doc, "author." + a + ".contactInformation.address.state.$t", "No state found", true));
						atom.setProperty(thisAuthorPath + "ContactInformation.Address.Zip", objGet(doc, "author." + a + ".contactInformation.address.zip.$t", "No zip found", true));
					}					
				}else{
					atom.setProperty("Author.Name", objGet(doc, "author.name", "No name found", true));
					atom.setProperty("Author.ContactInformation.Phone", objGet(doc, "author.contactInformation.phone.$t", "No phone found", true));
					atom.setProperty("Author.ContactInformation.Email", objGet(doc, "author.contactInformation.email.$t", "No email found", true));
					atom.setProperty("Author.ContactInformation.Address.Street", objGet(doc, "author.contactInformation.address.street.$t", "No address found", true));
					atom.setProperty("Author.ContactInformation.Address.City", objGet(doc, "author.contactInformation.address.city.$t", "No city found", true));
					atom.setProperty("Author.ContactInformation.Address.State", objGet(doc, "author.contactInformation.address.state.$t", "No state found", true));
					atom.setProperty("Author.ContactInformation.Address.Zip", objGet(doc, "author.contactInformation.address.zip.$t", "No zip found", true));
				}
			}else{
				atom.setProperty("Author", thisAuthor);
			}
			
			///Set geographic extent
			thisGeoExt = objGet(doc, "georss:box", "No geographic extent found", true);
			if(thisGeoExt != "No geographic extent found"){
				rGeoExt = thisGeoExt.toString().split(" ");
				if(rGeoExt.length == 4){
					atom.setProperty("GeographicExtent.WestBound", rGeoExt[0]);
					atom.setProperty("GeographicExtent.SouthBound", rGeoExt[1]);
					atom.setProperty("GeographicExtent.EastBound", rGeoExt[2]);
					atom.setProperty("GeographicExtent.NorthBound", rGeoExt[3]);
				}
			}else{
				atom.setProperty("GeographicExtent", thisGeoExt);
			}
			

			///Identify if this is a scast atom feed
			thisLinks = objGet(doc, "link", "", false);
			thisScastSemantics = objGet(doc, "scast:serviceSemantics.$t", "", true);
			
			atom.setProperty("Links",[]);
			if(thisScastSemantics && thisLinks) { ///This is an atom feed with service casting namespace
				for(l in thisLinks){
					thisRel = objGet(thisLinks, l + ".rel", "", false);
					thisUrl = objGet(doc, "link." + l + ".href", "No URL found", true);
					if(thisRel == "scast:interfaceDescription" || thisRel == "scast:serviceInterface"){
						atom.setProperty("Links." + l + ".Type", thisScastSemantics);
						atom.setProperty("Links." + l + ".URL", thisUrl);
					}else{
						parseUrl(thisUrl, "Links." + l);
					}
				}
			} else if(thisLinks){ ///This is an atom feed without service casting namespace

				if(thisLinks.constructor.toString().indexOf("Array") != -1){///ObjLinks is an array
					
					for(l in thisLinks){
						thisUrl = objGet(doc, "link." + l + ".href", "", true);
						if(thisUrl){
							parseUrl(thisUrl, "Links." + l);
						}
					}
				}else{///ObjLinks is not an array
					thisUrl = objGet(doc, "link.href", "", true);
					if(thisUrl){
						parseUrl(thisUrl, "Links.0")
					}
				}
			}
			
			atom.setProperty("HarvestInformation.ExtraContent", extra);

			emit(doc._id, atom);

			///Identify the type of link if service casting is not provided
			///Parameters: thisUrl - the link to be parsed; propName - the link property needs to be set values
			function parseUrl(thisUrl, propName) {
				if(thisUrl.search(/getcapabilities/i) != -1) {
					if(thisUrl.search(/wms/i) != -1) {
						///WMS service
						setLinkProp("OGC.WMS", thisUrl, propName)						
					} else if(thisUrl.search(/wfs/i) != -1) {
						///WFS service
						setLinkProp("OGC.WFS", thisUrl, propName)
					} else if(thisUrl.search(/csw/i) != -1) {
						///CSW service
						setLinkProp("OGC.CSW", thisUrl, propName);
					}
				}else if(thisUrl.search(/download/i) != -1) {
					///Download service
					setLinkProp("Download", thisUrl, propName);
				}else{
					setLinkProp("Unknown", thisUrl, propName);
				}

			}
			
			function setLinkProp(type, url, propName){
				atom.setProperty(propName + ".Type", type);
				atom.setProperty(propName + ".URL", url);
			}
			
		}
	}
};
