var exports = module.exports;

/*
 * Please configure _dbInfo and _serverInfo for your system
 */
_dbInfo = {
	dbHost: "localhost",
	dbPort: 5984,
	databases: {
        dbRepoName: "repository",
        dbHarvestName: "harvested",
        dbCollectionName: "collections",
        dbContactsName: "contacts"        	
	},
	dbVersion: 1.0
};

_serverInfo = {
	serverTitle: "USGIN Resource Repository",
	serverSubTitle: "document archiving, metadata management and resource discovery",
	serverLogoLocation: "/static/img/usgin.png",
	localListenAddress: "localhost",
	localListenPort: 3005,
};

_organizationInfo = {
	orgName: "Arizona Geological Survey",
	orgUrl: "http://azgs.az.gov",
	orgYear: 2011,
	orgEmail: "web-admin@azgs.az.gov"
};

/*
 * Please do not adjust the following configurations
 */
_searchInfo = {
	searchUrl: _dbInfo.dbVersion >= 1.1 ? "/_fti/local/" + _dbInfo.databases.dbRepoName + "/_design/indexes/" : "/" + _dbInfo.databases.dbRepoName + "/_fti/_design/indexes/"
};

_storageFormat = function() {
	this.contactTemplate = {
	    Name: "First and Last Name",
	    ContactInformation: {
		    Phone: "123-456-7890",
		    email: "example@fake.com",
		    Address: {
		    	Street: "1234 Somewhere Pl.",
		    	City: "Tucson",
		    	State: "AZ",
		    	Zip: "12345"
		    }
	    }
	};
	this.fileLinkTemplate = {
		URL: "http://fake.server.com/path/to/your/file"
	};
	this.serviceLinkTemplate = {
		ServiceType: "URI identifying the type of service available at the URL given",
		URL: "http://fake.server.com/path/to/your/service",
		LayerId: "Optional layer identifier for finding the described data in the service"
	}; 
	this.metadataTemplate = {
		Title: "The title of the resource being described",
		Description: "A description of what the resource being described is about",
		Authors: [ this.contactTemplate ],
	    PublicationDate: "Please use a format like this: 2011-10-11T14:30",
	    Keywords: ["List", "Some", "Keywords"],
	    GeographicExtent: {
	    	NorthBound: 45.0,
	    	SouthBound: 30.0,
	    	EastBound: -112.0,
	    	WestBound: -109.0
	    },
	    Distributors: [ this.contactTemplate ],
	    Links: [ this.fileLinkTemplate, this.serviceLinkTemplate ]
	};
};

_storage = new _storageFormat();

_defaultContext = {
	mainLogo: _serverInfo.serverLogoLocation,
	mainTitle: _serverInfo.serverTitle,
	mainSubTitle: _serverInfo.serverSubTitle,
	orgName: _organizationInfo.orgName,
	orgUrl: _organizationInfo.orgUrl,
	orgYear: _organizationInfo.orgYear,
	helpEmail: _organizationInfo.orgEmail,
	contactTemplate: JSON.stringify(_storage.contactTemplate),
	fileLinkTemplate: JSON.stringify(_storage.fileLinkTemplate),
	serviceLinkTemplate: JSON.stringify(_storage.serviceLinkTemplate),
	metadataTemplate: JSON.stringify(_storage.metadataTemplate)
};

exports.dbInfo = _dbInfo;
exports.serverInfo = _serverInfo;
exports.searchInfo = _searchInfo;
exports.defaultContext = _defaultContext;
exports.storageFormat = _storage;
