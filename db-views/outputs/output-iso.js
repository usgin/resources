var exports = module.exports;

exports.views = {
	iso: {
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
			
			serviceLinks = [], datasetLinks = [], docLinks = objGet(doc, "Links", []);
			for (var l in docLinks) {
				thisLink = docLinks[l];	
				
				if (capServiceTypes.indexOf(objGet(thisLink, "ServiceType", "None").toUpperCase()) != -1) {
					serviceLinks.push(thisLink);
				} else {
					datasetLinks.push(thisLink);
				}
			}			
			
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
			
			// Hierarchy, whatever the fuck that is
			iso.setProperty("gmd:MD_Metadata.gmd:hierarchyLevel.gmd:MD_ScopeCode.codeList", "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#MD_ScopeCode");
			iso.setProperty("gmd:MD_Metadata.gmd:hierarchyLevel.gmd:MD_ScopeCode.codeListValue", "Dataset");
			iso.setProperty("gmd:MD_Metadata.gmd:hierarchyLevel.gmd:MD_ScopeCode.$t", "Dataset");
			iso.setProperty("gmd:MD_Metadata.gmd:hierarchyLevelName.gco:CharacterString.$t", "Dataset");
			
			// TODO: Collect Metadata Contact Information. Preferably through login information. 
			// Metadata Contact Information -- I'm not collecting this yet! -- Using AZGS For now.
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:organisationName.gco:CharacterString.$t", "Arizona Geological Survey");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:voice.gco:CharacterString.$t", "520-770-3500");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:phone.gmd:CI_Telephone.gmd:facsimile.gco:CharacterString.$t", "520-770-3505");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:deliveryPoint.gco:CharacterString.$t", "416 W Congress St. Suite 100");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:city.gco:CharacterString.$t", "Tucson");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:postalCode.gco:CharacterString.$t", "85701");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:country.gco:CharacterString.$t", "USA");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:address.gmd:CI_Address.gmd:electronicMailAddress.gco:CharacterString.$t", "metadata@usgin.org");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:contactInfo.gmd:CI_Contact.gmd:onlineResource.gmd:CI_OnlineResource.gmd:linkage.gmd:URL.$t", "http://azgs.az.gov/");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.codeList", "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/Codelist/gmxCodelists.xml#CI_RoleCode");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.codeListValue", "pointOfContact");
			iso.setProperty("gmd:MD_Metadata.gco:contact.gmd:CI_ResponsibleParty.gmd:role.gmd:CI_RoleCode.$t", "pointOfContact");
			
			// Metadata Modified Date
			iso.setProperty("gmd:MD_Metadata.gmd:dateStamp.gco:DateTime.$t", objGet(doc, "ModifiedDate", "")); 
			
			// Metadata Standard Info
			iso.setProperty("gmd:MD_Metadata.gmd:MetadataStandardName.gco:CharacterString.$t", "ISO-USGIN");
			iso.setProperty("gmd:MD_Metadata.gmd:metadataStandardVersion.gco:CharacterString.$t", "1.2");
			
			// Dataset URI -- should that be related to the metadata ID??
			iso.setProperty("gmd:MD_Metadata.gmd:dataSetURI.gco:CharacterString.$t", "http://resources.usgin.org/uri-gin/usgin/resource/" + doc._id);
						
			// Finished!!
			emit(doc._id, iso);
			//return iso;
		}
	}	
};