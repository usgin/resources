var exports = module.exports;

exports.link = {
	id: "http://resources.usgin.org/uri-gin/usgin/schema/json-link/",
	type: "object",
	properties: {
		URL: { type: "string", format: "uri", required: true },
		Name: { type: "string", required: false },
		Description: { type: "string", required: false }, 
		Distributor: { type: "string", required: false }
	}
};

exports.serviceLink = {
	id: "http://resources.usgin.org/uri-gin/usgin/schema/json-service-link/",
	type: "object",
	properties: {
		ServiceType: { type: "string", required: true, enum: ["OGC:WMS", "OGC:WFS", "OGC:WCS", "OPeNDAP", "ESRI"] }, 
		LayerId: { type: "string", required: false }
	},
	"extends": "http://resources.usgin.org/uri-gin/usgin/schema/json-link/"
};

exports.contact = {
	id: "http://resources.usgin.org/uri-gin/usgin/schema/json-metadata-contact/",
	type: "object",
	properties: {
		Name: { type: "string", required: true },
		OrganizationName: { type: "string", required: false },
		ContactInformation: { type: "object", required: true,
			properties: {
				Phone: { type: "string", format: "phone", required: false }, 
				email: { type: "string", format: "email", required: true }, 
				Address: { type: "object", required: false,
					properties: {
						Street: { type: "string", required: true }, 
						City: { type: "string", required: true }, 
						State: { type: "string", required: true }, 
						Zip: { type: "number", required: true }
					}
				}
			}
		}
	}
};

exports.metadata = {
	id: "http://resources.usgin.org/uri-gin/usgin/schema/json-metadata/",
	type: "object",
	properties: {
		Title: { type: "string", required: true }, 
		Description: { type: "string", required: true, minLength: 50 }, 
		PublicationDate: { type: "string", format: "date-time", required: true }, 
		Authors: { type: "array", required: true, minItems: 1,
			items: { $ref: "http://resources.usgin.org/uri-gin/usgin/schema/json-metadata-contact/" }
		}, 		
		Keywords: { type: "array", required: true, minItems: 1,
			items: { type: "string" }
		}, 
		GeographicExtent: { type: "object", required: true,
			properties: {
				NorthBound: { type: "number", minimum: -90, maximum: 90, required: true }, 
				SouthBound: { type: "number", minimum: -90, maximum: 90, required: true }, 
				EastBound: { type: "number", minimum: -180, maximum: 180, required: true }, 
				WestBound: { type: "number", minimum: -180, maximum: 180, required: true }
			}
		}, 
		Distributors: { type: "array", required: true, minItems: 1,
			items: { $ref: "http://resources.usgin.org/uri-gin/usgin/schema/json-metadata-contact/" }
		}, 
		Links: { type: "array", required: true, minItems: 0,
			items: { $ref: "http://resources.usgin.org/uri-gin/usgin/schema/json-link/" }
		},
		HarvestInformation: { type: "object", required: false,
			properties: {
				OriginalFileIdentifier: { type: "string", required: false },
				OriginalFormat: { type: "string", required: false },
				HarvestRecordId: {type: "string", required: true },
				HarvestURL: { type: "string", required: true },
				HarvestDate: { type: "string", format: "date-time", required: true }
			}
		},
		Collections: { type: "array", required: true, minItems: 0,
			items: { type: "string" }
		},
		Published: { type: "boolean", required: true }
	}
};