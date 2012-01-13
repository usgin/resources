var exports = module.exports;

exports.views = {
	atom: {
		map: function(atom) {
			objGet = function(obj, propName, defVal) {
				if (!obj) { return defVal; }
				propParts = propName.split(".");
				for (var i = 0; i < propParts.length; i ++) {
					if (obj.hasOwnProperty(propParts[i])) {
						obj = obj[propParts[i]];
						if (i == propParts.length - 1) { 							
							return obj; 
						}
					} else {
						return defVal;
					}
				}
			};
			
			doc = {
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
			
			// List of service type identifiers
			var serviceTypes = ["OGC:WMS", "OGC:WFS", "OGC:WCS", "esri", "opendap"], capServiceTypes = [];			
			for (var s in serviceTypes) { capServiceTypes[s] = serviceTypes[s].toUpperCase(); }
			
			// Function to guess if URL is one serviceType or another
			function guessServiceType(url) {
				// Conditions array has the same length as serviceTypes array. Each entry is a collections of regular expressions.
				//	Each expression in a set has to validate in order for a URL to be identified as a particular service type -- no ORs.
				var conditions = [ [/getcapabilities/i, /wms/i], [/getcapabilities/i, /wfs/i], [/getcapabilities/i, /wcs/i], [/\/services\//i, /\/mapserver\/?$/i], [/\.dds$/] ];
				
				// Loop through all the service types
				for (var i = 0; i < serviceTypes.length; i++) {
					// Grab the conditions for this service type
					thisCondition = conditions[i];
					
					// Setup a boolean for whether or not the URL satisfies the conditions. If there are no conditions given,
					//	then the URL fails to satisfy
					satisfiesCondition = true;
					if (thisCondition.length == 0) { satisfiesCondition = false; }
					
					// Loop through the regular expressions in this condition. If any of them fail then the condition is not satisfied.
					for (var k = 0; k < thisCondition.length; k++) {
						if (url.search(thisCondition[k]) == -1) { satisfiesCondition = false; }
					}
					
					// If the condition was satisfied, then we've found our service type
					if (satisfiesCondition) { return serviceTypes[i]; }
				}
				
				// No conditions were satisfied -- we don't know the service type or perhaps it is not a service at all
				return null;
			}

			/**********************************************************************************************/
			///Set title
			doc.setProperty("Title", objGet(atom, "title.$t", "No title found"));
			
			///Set summary
			doc.setProperty("Description", objGet(atom, "summary.$t", "No summary found"));
			
			///Set author information
			docAuthors = objGet(atom, "author", []);
			if (docAuthors.hasOwnProperty("name")) { docAuthors = [ docAuthors ]; }
			outAuthors = [];
			for (a in docAuthors) {
				outAuthors.push({
					Name: objGet(docAuthors[a], "name.$t", "No name found"),
					ContactInformation: {
						Phone: objGet(docAuthors[a], "contactInformation.phone.$t", "No phone found"),
						email: objGet(docAuthors[a], "contactInformation.email.$t", "No email found"),
						Address: {
							Street: objGet(docAuthors[a], "contactInformation.address.street.$t", "No address found"),
							City: objGet(docAuthors[a], "contactInformation.address.city.$t", "No city found"),
							State: objGet(docAuthors[a], "contactInformation.address.state.$t", "No state found"),
							Zip: objGet(docAuthors[a], "contactInformation.address.zip.$t", "No zip found")
						}
					}
				});
			}
			
			doc.setProperty("Author", outAuthors);
			
			///Set geographic extent
			thisGeoExt = objGet(atom, "georss:box.$t", "No geographic extent found");
			if(thisGeoExt != "No geographic extent found"){
				rGeoExt = thisGeoExt.toString().split(" ");
				if(rGeoExt.length == 4){
					doc.setProperty("GeographicExtent.WestBound", rGeoExt[0]);
					doc.setProperty("GeographicExtent.SouthBound", rGeoExt[1]);
					doc.setProperty("GeographicExtent.EastBound", rGeoExt[2]);
					doc.setProperty("GeographicExtent.NorthBound", rGeoExt[3]);
				}
			}else{
				doc.setProperty("GeographicExtent", thisGeoExt);
			}
			

			///Identify if this is a scast atom feed
			thisLinks = objGet(atom, "link", []);
			if (thisLinks.constructor.toString().indexOf("Array") == -1) { thisLinks = [ thisLinks ]; }
			thisScastSemantics = objGet(atom, "scast:serviceSemantics.$t", null);					
			
			doc.setProperty("Links",[]);
			
			if (thisScastSemantics) { ///This is an atom feed with service casting namespace
				// Check if the semantics match one of our serviceType Identifiers, note that semantics vocab uses . instead of :
				adjustedSemantics = thisScastSemantics.replace(/\./, ":").toUpperCase();
				thisServiceType = "OTHER";
				for (var st in capServiceTypes) {				
					if (capServiceTypes[st].search(adjustedSemantics) != -1) { thisServiceType = serviceTypes[st]; }
				}
				
				for(l in thisLinks){
					thisRel = objGet(atom, "link." + l + ".rel", "alternate");
					thisUrl = objGet(atom, "link." + l + ".href", "No URL found");
					doc.setProperty("Links." + l + ".URL", thisUrl);
					if (thisRel == "scast:interfaceDescription" || thisRel == "scast:serviceInterface") {
						doc.setProperty("Links." + l + ".ServiceType", thisServiceType);						
					} else {
						guessedServiceType = guessServiceType(thisUrl);
						if (guessedServiceType) { doc.setProperty("Links." + l + ".ServiceType", guessedServiceType); }
					}
				}
			} else { ///This is an atom feed without service casting namespace
				for (l in thisLinks) {
					thisUrl = objGet(atom, "link." + l + ".href", "No Url Was Given");
					doc.setProperty("Links." + l + ".URL", thisUrl);
					guessedServiceType = guessServiceType(thisUrl);
					if (guessedServiceType) { doc.setProperty("Links." + l + ".ServiceType", guessedServiceType); }					
				}
			}

			emit(atom._id, doc);
			//return doc;
		}
	}
};
