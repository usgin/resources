var exports = module.exports;

exports.views = {
	iso: {
		map: function(iso) {			
			objGet = function(obj, propName, defVal) {
				propParts = propName.split(".");
				if (!obj || propParts.length == 0) { return defVal; }
				for (var i = 0; i < propParts.length; i++) {
					thisProp = propParts[i];
					if (obj.hasOwnProperty(thisProp)) {
						obj = obj[thisProp];
						if (i == propParts.length -1) { return obj; }
					} else {
						return defVal;
					}
				}
			};
			
			doc = {
				setProperty: function(propName, value) {
					obj = this;
					propParts = propName.split(".");
					for (var i = 0; i < propParts.length; i++) {
						thisProp = propParts[i];
						if (obj.hasOwnProperty(thisProp)) {
							obj = obj[thisProp];
						} else {
							if (i == propParts.length - 1) { obj[thisProp] = value; } 
							else {
								obj[thisProp] = {};
								obj = obj[thisProp];
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
			// Find the appropriate identification info -- if there are multiple, the first is used.
			ident = objGet(iso, "gmd:MD_Metadata.gmd:identificationInfo", {});
			ident = objGet(ident, "0", ident);
			ident = objGet(ident, "gmd:MD_DataIdentification", objGet(ident, "srv:SV_ServiceIdentification", {}));
			
			// Find title/description
			doc.setProperty("Title", objGet(ident, "gmd:citation.gmd:CI_Citation.gmd:title.gco:CharacterString.$t", "No Title Was Given"));
			doc.setProperty("Description", objGet(ident, "gmd:abstract.gco:CharacterString.$t", "No Description Was Given"));
			
			// Publication Date
			doc.setProperty("PublicationDate", objGet(ident, "gmd:citation.gmd:CI_Citation.gmd:date.gmd:CI_Date.gmd:date.gco:DateTime.$t", "Publication Date Not Given"));
			
			// Find Authors
			respParties = objGet(ident, "gmd:citation.gmd:CI_Citation.gmd:citedResponsibleParty", []);
			if (respParties.hasOwnProperty("gmd:CI_ResponsibleParty")) { respParties = [ respParties ]; }
			authors = [];
			for (var p in respParties) {
				thisParty = respParties[p];
				role = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.codeListValue", "");
				if (["originator", "pointOfContact", "resourceProvider"].indexOf(role) != -1) {
					var author = {};
					author["Name"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString.$t", "No Name Was Given");
					if (author["Name"] == "Missing" || author["Name"] == "missing" || author["Name"] == "No Name Was Given") { 
						author["OrganizationName"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString.$t", "No Organization Name Was Given"); 
					}
					author["ContactInformation"] = {};
					author["ContactInformation"]["Phone"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString.$t", "No Phone Number Was Given");
					author["ContactInformation"]["email"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:electronicMailAddress.gco:CharacterString.$t", "No email Was Given");
					author["ContactInformation"]["Address"] = {};
					author["ContactInformation"]["Address"]["Street"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:deliveryPoint.gco:CharacterString.$t", "No Street Address Was Given");
					author["ContactInformation"]["Address"]["City"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:city.gco:CharacterString.$t", "No City Was Given");
					author["ContactInformation"]["Address"]["State"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:administrativeArea.gco:CharacterString.$t", "No State Was Given");
					author["ContactInformation"]["Address"]["Zip"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:postalCode.gco:CharacterString.$t", "No Zip Was Given");					
					
					if (author["ContactInformation"]["Phone"] == "No Phone Number Was Given" && 
						author["ContactInformation"]["email"] == "No email Was Given" &&
						author["ContactInformation"]["Address"]["Street"] == "No Street Address Was Given" &&
						author["ContactInformation"]["Address"]["City"] == "No City Was Given" &&
						author["ContactInformation"]["Address"]["State"] == "No State Was Given" &&
						author["ContactInformation"]["Address"]["Zip"] == "No Zip Was Given") { delete author.ContactInformation; }
					
					authors.push(author);
				}								
			}
			doc.setProperty("Authors", authors);
			
			// Find Keywords
			keywords = [];
			descKeywords = objGet(ident, "gmd:descriptiveKeywords", []);
			if (descKeywords.hasOwnProperty("gmd:MD_Keywords")) { descKeywords = [ descKeywords ]; }
			for (var d in descKeywords) {
				theseKeywords = descKeywords[d];
				actualKeywords = objGet(theseKeywords, "gmd:MD_Keywords.gmd:keyword", []);
				if (actualKeywords.hasOwnProperty("gco:CharacterString")) { actualKeywords = [ actualKeywords ]; }
				for (var k in actualKeywords) {
					thisKeyword = objGet(actualKeywords[k], "gco:CharacterString.$t", null);
					if (thisKeyword) {
						wordArr = thisKeyword.split(",");
						for (var wi in wordArr) {
							keywords.push(wordArr[wi].trim()); 
						}
					}
				}
			}
			doc.Keywords = keywords;
			
			// Extent Information
			theExtent = objGet(ident, "gmd:extent", objGet(ident, "srv:extent", {}));
			var geoExtent = {};
			if (theExtent.hasOwnProperty("0")) { 
				for (var e in theExtent) {
					if (objGet(theExtent[e], "gmd:EX_Extent.gmd:geographicElement", false)) {
						geoExtent = theExtent[e];					
					}
				}
			} else {
				geoExtent = theExtent;
			}
			
			doc.setProperty("GeographicExtent.NorthBound", objGet(geoExtent, "gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:northBoundLatitude.gco:Decimal.$t", 89));
			doc.setProperty("GeographicExtent.SouthBound", objGet(geoExtent, "gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:southBoundLatitude.gco:Decimal.$t", -89));
			doc.setProperty("GeographicExtent.EastBound", objGet(geoExtent, "gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:eastBoundLongitude.gco:Decimal.$t", 179));
			doc.setProperty("GeographicExtent.WestBound", objGet(geoExtent, "gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:westBoundLongitude.gco:Decimal.$t", -179));
			
			// Distribution -- Get distributors as a list
			isoDistributors = objGet(iso, "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:distributor", []);
			if (isoDistributors.hasOwnProperty("gmd:MD_Distributor")) { isoDistributors = [ isoDistributors ]; }
			distributors = [], links = {};
			for (var iDist in isoDistributors) {
				thisDist = objGet(isoDistributors[iDist], "gmd:MD_Distributor.gmd:distributorContact", {}); newDist = {};
				newDist["Name"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString.$t", "No Name Was Given");
				if (newDist["Name"] == "Missing" || newDist["Name"] == "missing" || newDist["Name"] == "No Name Was Given") { 
					newDist["OrganizationName"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString.$t", "No Organization Name Was Given"); 
				}
				newDist["ContactInformation"] = {};
				newDist["ContactInformation"]["Phone"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString.$t", "No Phone Number Was Given");
				newDist["ContactInformation"]["email"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:electronicMailAddress.gco:CharacterString.$t", "No email Was Given");
				newDist["ContactInformation"]["Address"] = {};
				newDist["ContactInformation"]["Address"]["Street"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:deliveryPoint.gco:CharacterString.$t", "No Street Address Was Given");
				newDist["ContactInformation"]["Address"]["City"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:city.gco:CharacterString.$t", "No City Was Given");
				newDist["ContactInformation"]["Address"]["State"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:administrativeArea.gco:CharacterString.$t", "No State Was Given");
				newDist["ContactInformation"]["Address"]["Zip"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:postalCode.gco:CharacterString.$t", "No Zip Was Given");					
				
				if (newDist["ContactInformation"]["Phone"] == "No Phone Number Was Given" && 
					newDist["ContactInformation"]["email"] == "No email Was Given" &&
					newDist["ContactInformation"]["Address"]["Street"] == "No Street Address Was Given" &&
					newDist["ContactInformation"]["Address"]["City"] == "No City Was Given" &&
					newDist["ContactInformation"]["Address"]["State"] == "No State Was Given" &&
					newDist["ContactInformation"]["Address"]["Zip"] == "No Zip Was Given") { delete newDist.ContactInformation; }
				
				distributors.push(newDist);
				
				
				distOptions = objGet(isoDistributors[iDist], "gmd:MD_Distributor.gmd:distributorTransferOptions", []);
				if (distOptions.hasOwnProperty("gmd:MD_DigitalTransferOptions")) { distOptions = [ distOptions ]; }
				for (var dist in distOptions) {
					thisDist = objGet(distOptions[dist], "gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource", {});
					thisLink = {};
					
					thisLink["URL"] = objGet(thisDist, "gmd:linkage.gmd:URL.$t", "No URL Was Given");
					linkProtocol = objGet(thisDist, "gmd:protocol.gco:CharacterString.$t", "No Protocol Was Given");
					ind = capServiceTypes.indexOf(linkProtocol.toUpperCase());
					if (ind != -1) {
						thisLink["ServiceType"] = serviceTypes[ind];
					} else {
						guessedServiceType = guessServiceType(thisLink["URL"]);
						if (guessedServiceType) { thisLink["ServiceType"] = guessedServiceType; }
					}
					
					if (newDist["Name"] == "Missing" || newDist["Name"] == "missing" || newDist["Name"] == "No Name Was Given") {
						if (newDist["OrganizationName"] && newDist["OrganizationName"] != "No Organization Name Was Given") {
							thisLink["Distributor"] = newDist["OrganizationName"];
						}
					} else  {
						thisLink["Distributor"] = newDist["Name"];
					}
										
					thisLink["Description"] = objGet(thisDist, "gmd:description.gco:CharacterString.$t", "No Description Was Given");
					links[thisLink["URL"]] = thisLink;					
				}
			}
			doc.Distributors = distributors;
			
			// Other Distribution Information
			distributions = objGet(iso, "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:transferOptions", []);
			if (distributions.hasOwnProperty("gmd:MD_DigitalTransferOptions")) { distributions = [ distributions ]; }
			for (var d in distributions) {
				thisDist = objGet(distributions[d], "gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource", {}); 
				thisLink = {};
				
				thisLink["URL"] = objGet(thisDist, "gmd:linkage.gmd:URL.$t", "No URL Was Given");
				
				linkProtocol = objGet(thisDist, "gmd:protocol.gco:CharacterString.$t", "No Protocol Was Given");
				ind = capServiceTypes.indexOf(linkProtocol.toUpperCase());
				if (ind != -1) {
					thisLink["ServiceType"] = serviceTypes[ind];
				} else {
					guessedServiceType = guessServiceType(thisLink["URL"]);
					if (guessedServiceType) { thisLink["ServiceType"] = guessedServiceType; }
				}
				
				thisLink["Description"] = objGet(thisDist, "gmd:description.gco:CharacterString.$t", "No Description Was Given");
				
				if (!(thisLink.URL in links)) {
					links[thisLink.URL] = thisLink;
				}
				
			}
			
			linksList = [];
			for (l in links) { linksList.push(links[l]); }
			doc.setProperty("Links", linksList);
			
			// Extra stuff in ISO that should probably be collected:
			doc.setProperty("ResourceIds", []);
			dataSetUri = objGet(iso, "gmd:MD_Metadata.gmd:dataSetURI.gco:CharacterString.$t", null);
			if (dataSetUri) { doc.setProperty("ResourceIds.0", dataSetUri); }
			
			// Harvest Information
			doc.setProperty("HarvestInformation.OriginalFileIdentifier", objGet(iso, "gmd:MD_Metadata.gmd:fileIdentifier.gco:CharacterString.$t"));
			doc.setProperty("HarvestInformation.OriginalFormat", "iso");
			
			emit(iso._id, doc);
			//return doc;
		}
	}	
};