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
			
			// Find the appropriate identification info -- if there are multiple, the first is used.
			ident = objGet(iso, "gmd:MD_Metadata.gmd:identificationInfo", {});
			ident = objGet(ident, "0", ident);
			ident = objGet(ident, "gmd:MD_DataIdentification", objGet(ident, "gmd:SV_ServiceIdentification", {}));
			
			// Find title/description
			doc.setProperty("Title", objGet(ident, "gmd:citation.gmd:CI_Citation.gmd:title.gco:CharacterString.$t", "No Title Was Given"));
			doc.setProperty("Description", objGet(ident, "gmd:abstract.gco:CharacterString.$t", "No Description Was Given"));
			
			// Publication Date
			doc.setProperty("PublicationDate", objGet(ident, "gmd:citation.gmd:CI_Citation.gmd:date.gmd:CI_Date.gmd:date.gco:DateTime.$t", "Publication Date Not Given"));
			
			// Find Authors
			respParties = objGet(ident, "gmd:citation.gmd:CI_Citation.gmd:citedResponsibleParty", []);
			authors = [];
			for (var p in respParties) {
				thisParty = respParties[p];
				role = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.codeListValue", "");
				if (["originator", "pointOfContact"].indexOf(role) != -1) {
					var author = {};
					author["Name"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString.$t", objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString.$t", "No Name Was Given"));
					author["ContactInformation"] = {};
					author["ContactInformation"]["Phone"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString.$t", "No Phone Number Was Given");
					author["ContactInformation"]["email"] = objGet(thisParty, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:Address.gmd:electronicMailAddress.gco:CharacterString.$t", "No email Was Given");
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
			for (var d in descKeywords) {
				theseKeywords = descKeywords[d];
				actualKeywords = objGet(theseKeywords, "gmd:MD_Keywords.gmd:keyword", []);
				for (var k in actualKeywords) {
					thisKeyword = objGet(actualKeywords[k], "gco:CharacterString.$t", null);
					if (thisKeyword) { keywords.push(thisKeyword); }
				}
			}
			doc.Keywords = keywords;
			
			// Extent Information
			doc.setProperty("GeographicExtent.NorthBound", objGet(ident, "gmd:extent.gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:northBoundLatitude.gco:Decimal.$t", 89));
			doc.setProperty("GeographicExtent.SouthBound", objGet(ident, "gmd:extent.gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:southBoundLatitude.gco:Decimal.$t", -89));
			doc.setProperty("GeographicExtent.EastBound", objGet(ident, "gmd:extent.gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:eastBoundLongitude.gco:Decimal.$t", 179));
			doc.setProperty("GeographicExtent.WestBound", objGet(ident, "gmd:extent.gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:westBoundLongitude.gco:Decimal.$t", -179));
			
			// Distribution -- Get distributors as a list
			isoDistributors = objGet(iso, "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:distributor", []);
			if (isoDistributors.hasOwnProperty("gmd:MD_Distributor")) { isoDistributors = [ isoDistributors ]; }
			distributors = [], links = {};
			for (var iDist in isoDistributors) {
				thisDist = objGet(isoDistributors[iDist], "gmd:MD_Distributor.gmd:distributorContact", {}); newDist = {};
				newDist["Name"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString.$t", objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString.$t", "No Name Was Given"));
				newDist["ContactInformation"] = {};
				newDist["ContactInformation"]["Phone"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString.$t", "No Phone Number Was Given");
				newDist["ContactInformation"]["email"] = objGet(thisDist, "gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:Address.gmd:electronicMailAddress.gco:CharacterString.$t", "No email Was Given");
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
				
				distOption = objGet(isoDistributors[iDist], "gmd:MD_Distributor.gmd:distributorTransferOptions.gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource", null);
				if (distOption) {
					thisLink = {};
					thisLink["Type"] = objGet(distOption, "gmd:description.gco:CharacterString.$t", "Unknown");
					thisLink["URL"] = objGet(distOption, "gmd:linkage.gmd:URL.$t", "No URL Was Given");
					thisLink["Distributor"] = newDist.Name;
					links[thisLink["URL"]] = thisLink;
				}
			}
			doc.Distributors = distributors;
			
			// Other Distribution Information
			distributions = objGet(iso, "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:transferOptions", []);
			if (distributions.hasOwnProperty("gmd:MD_DigitalTransferOptions")) { distributions = [ distributions ]; }
			for (var d in distributions) {
				thisDist = objGet(distributions[d], "gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource", {}); thisLink = {};
				thisLink["Type"] = objGet(thisDist, "gmd:description.gco:CharacterString.$t", "Unknown");
				thisLink["URL"] = objGet(thisDist, "gmd:linkage.gmd:URL.$t", "No URL Was Given");
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