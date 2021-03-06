var exports = module.exports;

exports.views = {
	"iso.xml": {
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
			
			iso = {
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
			
			function writeContactInfo(contactObj, isoLocation, role) {
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:individualName.gco:CharacterString.$t", objGet(contactObj, "Name", "No Name Was Given"));
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString.$t", objGet(contactObj, "OrganizationName", "No Organization Name Was Given"));
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString.$t", objGet(contactObj, "ContactInformation.Phone", "No Phone Number Was Given"));				
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:deliveryPoint.gco:CharacterString.$t", objGet(contactObj, "ContactInformation.Address.Street", "No Street Was Given"));
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:city.gco:CharacterString.$t", objGet(contactObj, "ContactInformation.Address.City", "No Street Was Given"));
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:administrativeArea.gco:CharacterString.$t", objGet(contactObj, "ContactInformation.Address.State", "No State Was Given"));
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:postalCode.gco:CharacterString.$t", objGet(contactObj, "ContactInformation.Address.Zip", "No Zip Code Was Given"));
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:electronicMailAddress.gco:CharacterString.$t", objGet(contactObj, "ContactInformation.email", "No email Address Was Given"));
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.codeList", "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#CI_RoleCode");
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.codeListValue", role);
				iso.setProperty(isoLocation + ".gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.$t", role);
			}
			function computeId(linkObj) {
				return linkObj.URL.replace(/http:\/\//, "").replace(/\//g, "-").replace(/\./g, "-").replace(/=/g, "-").replace(/\?.+$/g, "");
			}
			
			function writeLinkInfo(linkObj, isoLocation, addId) {
				if (addId) { iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.id", computeId(linkObj)); }
				iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:linkage.gmd:URL.$t", objGet(linkObj, "URL", "No URL Was Given"));				
				serviceType = objGet(linkObj, "ServiceType", false);
				descriptionString = objGet(linkObj, "Description", "");	
				layerId = objGet(linkObj, "layerId", false);
				
				if (serviceType) {
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:protocol.gco:CharacterString.$t", serviceType);
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:name.gco:CharacterString.$t", "serviceDescription");
					if (layerId) { descriptionString += " This dataset is available as a layer or featuretype within this service. Look for " + layerId + "."; }
					if (descriptionString != "") {
						iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:description.gco:CharacterString.$t", descriptionString);
					}
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:function.gmd:CI_OnLineFunctionCode.codeListValue", "381");
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:function.gmd:CI_OnLineFunctionCode.codeList","http://www.fgdc.gov/nap/metadata/register/registerItemClasses.html#IC_88");
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:function.gmd:CI_OnLineFunctionCode.$t", "webService");
				} else {
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:name.gco:CharacterString.$t", "downloadableFile");
					if (descriptionString != "") {
						iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:description.gco:CharacterString.$t", descriptionString);
					}
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:function.gmd:CI_OnLineFunctionCode.codeListValue", "375");
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:function.gmd:CI_OnLineFunctionCode.codeList","http://www.fgdc.gov/nap/metadata/register/registerItemClasses.html#IC_88");
					iso.setProperty(isoLocation + ".gmd:MD_DigitalTransferOptions.gmd:onLine.gmd:CI_OnlineResource.gmd:function.gmd:CI_OnLineFunctionCode.$t", "download");
				}										
			}
			
			// List of service type identifiers
			var serviceTypes = ["OGC:WMS", "OGC:WFS", "OGC:WCS", "esri", "opendap"], capServiceTypes = [];
			for (var s in serviceTypes) { capServiceTypes[s] = serviceTypes[s].toUpperCase(); }						
			
			/**********************************************************************************************
			 * Metadata Information
			 **********************************************************************************************/
			
			// Namespaces
			iso.setProperty("gmd:MD_Metadata.xmlns:gml", "http://www.opengis.net/gml");
			iso.setProperty("gmd:MD_Metadata.xmlns:xlink", "http://www.w3.org/1999/xlink");
			iso.setProperty("gmd:MD_Metadata.xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
			iso.setProperty("gmd:MD_Metadata.xmlns:gmd", "http://www.isotc211.org/2005/gmd");
			iso.setProperty("gmd:MD_Metadata.xmlns:gco", "http://www.isotc211.org/2005/gco");
			iso.setProperty("gmd:MD_Metadata.xsi:schemaLocation", "http://www.isotc211.org/2005/gmd http://schemas.opengis.net/csw/2.0.2/profiles/apiso/1.0.0/apiso.xsd");
			
			// File Identifier
			iso.setProperty("gmd:MD_Metadata.gmd:fileIdentifier.gco:CharacterString.$t", doc._id);
			
			// Language
			iso.setProperty("gmd:MD_Metadata.gmd:language.gco:CharacterString.$t", "eng");
			
			// CharacterSet
			iso.setProperty("gmd:MD_Metadata.gmd:characterSet.gmd:MD_CharacterSetCode.codeList", "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#MD_CharacterSetCode");
			iso.setProperty("gmd:MD_Metadata.gmd:characterSet.gmd:MD_CharacterSetCode.codeListValue", "utf8");
			iso.setProperty("gmd:MD_Metadata.gmd:characterSet.gmd:MD_CharacterSetCode.$t", "UTF-8");
			
			// Hierarchy!!!
			iso.setProperty("gmd:MD_Metadata.gmd:hierarchyLevel.gmd:MD_ScopeCode.codeList", "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#MD_ScopeCode");
			iso.setProperty("gmd:MD_Metadata.gmd:hierarchyLevel.gmd:MD_ScopeCode.codeListValue", "Dataset");
			iso.setProperty("gmd:MD_Metadata.gmd:hierarchyLevel.gmd:MD_ScopeCode.$t", "Dataset");
			iso.setProperty("gmd:MD_Metadata.gmd:hierarchyLevelName.gco:CharacterString.$t", "Dataset");
			
			// TODO: Collect Metadata Contact Information. Preferably through login information. 
			// Metadata Contact Information -- I'm not collecting this yet! -- Using AZGS For now.
			azgsContact = {
		        OrganizationName: "Arizona Geological Survey",
		        ContactInformation: {
		            Phone: "520-770-3500",
		            email: "metadata@usgin.org",
		            Address: {
		                Street: "416 W Congress St. Ste. 100",
		                City: "Tucson",
		                State: "AZ",
		                Zip: "85701"
		            }
		        }
		    };
			writeContactInfo(azgsContact, "gmd:MD_Metadata.gmd:contact", "pointOfContact");
			
			// Metadata Modified Date
			iso.setProperty("gmd:MD_Metadata.gmd:dateStamp.gco:DateTime.$t", objGet(doc, "ModifiedDate", "")); 
			
			// Metadata Standard Info
			iso.setProperty("gmd:MD_Metadata.gmd:metadataStandardName.gco:CharacterString.$t", "ISO-USGIN");
			iso.setProperty("gmd:MD_Metadata.gmd:metadataStandardVersion.gco:CharacterString.$t", "1.2");
			
			// Dataset URI -- if we have one...
			dsId = objGet(doc, "ResourceId", null);
			if (dsId) { iso.setProperty("gmd:MD_Metadata.gmd:dataSetURI.gco:CharacterString.$t", dsId); }

			/**********************************************************************************************
			 * Identification Info
			 **********************************************************************************************/
			
			// Title
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:citation.gmd:CI_Citation.gmd:title.gco:CharacterString.$t", objGet(doc, "Title", "No Title Was Given"));
			
			// Publication Date
			
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:citation.gmd:CI_Citation.gmd:date.gmd:CI_Date.gmd:date.gco:DateTime.$t", objGet(doc, "PublicationDate", "No Publication Date Was Given"));
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:citation.gmd:CI_Citation.gmd:date.gmd:CI_Date.gmd:dateType.gmd:CI_DateTypeCode.codeList", "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#CI_DateTypeCode");
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:citation.gmd:CI_Citation.gmd:date.gmd:CI_Date.gmd:dateType.gmd:CI_DateTypeCode.codeListValue", "publication");
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:citation.gmd:CI_Citation.gmd:date.gmd:CI_Date.gmd:dateType.gmd:CI_DateTypeCode.$t", "publication");
			
			// Authors
			docAuthors = objGet(doc, "Authors", []);
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:citation.gmd:CI_Citation.gmd:citedResponsibleParty", []);
			for (a in docAuthors) { 
				writeContactInfo(docAuthors[a], "gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:citation.gmd:CI_Citation.gmd:citedResponsibleParty." + a, "originator");
			}
			
			// Abstract
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:abstract.gco:CharacterString.$t", objGet(doc, "Description", "No Description Was Given"));
			
			// Status
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:status.gmd:MD_ProgressCode.codeList", "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#MD_ProgressCode");
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:status.gmd:MD_ProgressCode.codeListValue", "completed");
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:status.gmd:MD_ProgressCode.$t", "completed");
			
			// Keywords
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:descriptiveKeywords", []);
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:descriptiveKeywords.0.gmd:MD_Keywords.gmd:keyword", []);
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:descriptiveKeywords.0.gmd:MD_Keywords.gmd:type.gmd:MD_KeywordTypeCode.codeList", "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#MD_KeywordTypeCode");
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:descriptiveKeywords.0.gmd:MD_Keywords.gmd:type.gmd:MD_KeywordTypeCode.codeListValue", "theme");
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:descriptiveKeywords.0.gmd:MD_Keywords.gmd:type.gmd:MD_KeywordTypeCode.$t", "theme");
			
			docKeywords = objGet(doc, "Keywords", []);
			for (k in docKeywords) {
				iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:descriptiveKeywords.0.gmd:MD_Keywords.gmd:keyword." + k + ".gco:CharacterString.$t", docKeywords[[k]]);
			}
			
			// Language
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:language.gco:CharacterString.$t", "eng");
			
			// Category!!!
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:topicCategory.gmd:MD_TopicCategoryCode.$t", "geoscientificInformation");
			
			// Extent
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:extent.gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:westBoundLongitude.gco:Decimal.$t", objGet(doc, "GeographicExtent.WestBound"));
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:extent.gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:eastBoundLongitude.gco:Decimal.$t", objGet(doc, "GeographicExtent.EastBound"));
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:extent.gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:southBoundLatitude.gco:Decimal.$t", objGet(doc, "GeographicExtent.SouthBound"));
			iso.setProperty("gmd:MD_Metadata.gmd:identificationInfo.gmd:MD_DataIdentification.gmd:extent.gmd:EX_Extent.gmd:geographicElement.gmd:EX_GeographicBoundingBox.gmd:northBoundLatitude.gco:Decimal.$t", objGet(doc, "GeographicExtent.NorthBound"));
			
			/**********************************************************************************************
			 * Distribution Info
			 **********************************************************************************************/
			
			docDistributors = objGet(doc, "Distributors", []);
			docLinks = objGet(doc, "Links", []); 
			
			iso.setProperty("gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:distributor", []);
			iso.setProperty("gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:transferOptions", []);
			
			// Write all the links to gmd:transferOptions
			for (var l = 0; l < docLinks.length; l++) {
				writeLinkInfo(docLinks[l], "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:transferOptions." + l, true);
			}
			
			// Loop through doc distributors. If links identify a distributor, then add it the the MD_Distributor
			for (d in docDistributors) {
				writeContactInfo(docDistributors[d], "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:distributor." + d + ".gmd:MD_Distributor.gmd:distributorContact", "distributor");
				
				var dl = 0;
				
				for (var l = docLinks.length -1; l >= 0; l--) {					
					// Find the link's Distributor
					distName = objGet(docLinks[l], "Distributor", "None").trim();
					
					// If the link's distributor matches the distributor we're currently working with ...
					if (distName == objGet(docDistributors[d], "Name", null) || distName == objGet(docDistributors[d], "OrganizationName", null)) {
						// If this distributor doesn't have any transferOptions yet...
						if (!objGet(iso, "gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:distributor." + d + ".gmd:MD_Distributor.gmd:distributorTransferOptions", false)) {
							// Create an empty array for this distributor's transferOptions
							iso.setProperty("gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:distributor." + d + ".gmd:MD_Distributor.gmd:distributorTransferOptions", []);
						}
						// Write the link to the distributor's transferOptions as an xlink:href
						iso.setProperty("gmd:MD_Metadata.gmd:distributionInfo.gmd:MD_Distribution.gmd:distributor." + d + ".gmd:MD_Distributor.gmd:distributorTransferOptions." + dl + ".xlink:href", "#" + computeId(docLinks[l]));
						// Remove this link from the array, so subsequent loops are shorter
						docLinks.splice(l, 1);
						// Increment the counter for the number of transferOptions this distributor has
						dl++;
					}
				}
			}
			
			// Finished!!
			emit(doc._id, iso);
			//return iso;
		}
	}	
};