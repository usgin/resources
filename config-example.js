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
        dbCollectionName: "collections"
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
	orgYear: 2011
};

/*
 * Please do not adjust the following configurations
 */
_searchInfo = {
	searchUrl: _dbInfo.dbVersion >= 1.1 ? "/_fti/local/" + _dbInfo.dbRepoName + "/_design/indexes/" : "/" + _dbInfo.dbRepoName + "/_fti/_design/indexes/"
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
	this.linkTemplate = {
		Type: "Describe how the link is to be used (download, wms, random service, etc.)",
		URL: "http://fake.server.com/path/to/your/resource"
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
	    Links: [ this.linkTemplate ]
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
	contactTemplate: JSON.stringify(_storage.contactTemplate),
	linkTemplate: JSON.stringify(_storage.linkTemplate),
	metadataTemplate: JSON.stringify(_storage.metadataTemplate)
};

exports.dbInfo = _dbInfo;
exports.serverInfo = _serverInfo;
exports.searchInfo = _searchInfo;
exports.defaultContext = _defaultContext;
exports.storageFormat = _storage;
