var exports = module.exports;

exports.dbInfo = {
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

exports.serverInfo = {
	serverTitle: "USGIN Resource Repository",
	serverSubTitle: "document archiving, metadata management and resource discovery",
	serverLogoLocation: "/static/img/usgin.png",
	localListenAddress: "localhost",
	localListenPort: 3005,
	googleAnalyticsAccountNumber: "UA-12345678-9"
};

exports.organizationInfo = {
	orgName: "Arizona Geological Survey",
	orgUrl: "http://azgs.az.gov",
	orgYear: 2011,
	orgEmail: "web-admin@azgs.az.gov"
};

exports.userInfo = {
	adminUser: "foo",
	adminSecret: "bar"
};