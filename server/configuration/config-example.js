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
	serverHostname: "localhost:3005",
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

exports.buildCollections = false;

exports.starterBrowseTree = [
    { name: "AASG Geothermal Data", description: "Datasets collected as part of the AASG Geothermal Data System.",
      children: [
          { name: "By State", description: "AASG Geothermal Datasets sorted by the contributing state's name",
        	children: [
        	    { name: "Alabama", description: "", children: [] },
        	    { name: "Alaska", description: "", children: [] },
        	    { name: "Arizona", description: "", children: [] },
        	    { name: "Arkansas", description: "", children: [] },
        	    { name: "California", description: "", children: [] },
        	    { name: "Colorado", description: "", children: [] },
        	    { name: "Connecticut", description: "", children: [] },
        	    { name: "Delaware", description: "", children: [] },
        	    { name: "Florida", description: "", children: [] },
        	    { name: "Georgia", description: "", children: [] },
        	    { name: "Hawaii", description: "", children: [] },
        	    { name: "Idaho", description: "", children: [] },
        	    { name: "Illinois", description: "", children: [] },
        	    { name: "Indiana", description: "", children: [] },
        	    { name: "Iowa", description: "", children: [] },
        	    { name: "Kansas", description: "", children: [] },
        	    { name: "Kentucky", description: "", children: [] },
        	    { name: "Louisiana", description: "", children: [] },
        	    { name: "Maine", description: "", children: [] },
        	    { name: "Maryland", description: "", children: [] },
        	    { name: "Massachusetts", description: "", children: [] },
        	    { name: "Michigan", description: "", children: [] },
        	    { name: "Minnesota", description: "", children: [] },
        	    { name: "Mississippi", description: "", children: [] },
        	    { name: "Missouri", description: "", children: [] },
        	    { name: "Montana", description: "", children: [] },
        	    { name: "Nebraska", description: "", children: [] },
        	    { name: "Nevada", description: "", children: [] },
        	    { name: "New Hampshire", description: "", children: [] },
        	    { name: "New Jersey", description: "", children: [] },
        	    { name: "New Mexico", description: "", children: [] },
        	    { name: "New York", description: "", children: [] },
        	    { name: "North Carolina", description: "", children: [] },
        	    { name: "North Dakota", description: "", children: [] },
        	    { name: "Ohio", description: "", children: [] },
        	    { name: "Oklahoma", description: "", children: [] },
        	    { name: "Oregon", description: "", children: [] },
        	    { name: "Pennsylvania", description: "", children: [] },
        	    { name: "Rhode Island", description: "", children: [] },
        	    { name: "South Carolina", description: "", children: [] },
        	    { name: "South Dakota", description: "", children: [] },
        	    { name: "Tennessee", description: "", children: [] },
        	    { name: "Texas", description: "", children: [] },
        	    { name: "Utah", description: "", children: [] },
        	    { name: "Vermont", description: "", children: [] },
        	    { name: "Virginia", description: "", children: [] },
        	    { name: "Washington", description: "", children: [] },
        	    { name: "West Virginia", description: "", children: [] },
        	    { name: "Wisconsin", description: "", children: [] },
        	    { name: "Wyoming", description: "", children: [] }
        	]  
          },
          { name: "By Data Type", description: "The AASG Geothermal Data project defines a number of different standardized data types or content models. See http://www.stategeothermaldata.org/data_delivery/content_model_templates for more information.",
            children: [
                { name: "Active Faults", description: "Fault feature. Each feature in an active fault data set (row in this spreadsheet) should be characterized by a unique combination of name, URI, geologic history, slip, locatability and orientation properties, as well as being physically connected or inferred to be connected in the Earth. For mapped active faults, which are the scope of this scheme, the deformation style is assumed to be brittle (as opposed to ductile).", children: []},
                { name: "Earthquake Hypocenters", description: "Design is focused on EQs hypocenters portrayed as points. Hypocenter data for geothermal data system is intended as a tool to identify seismically active areas that are often associated with hydrothermal activity, thus the content model does not include detailed information that would be important for seismological analysis; such information should be accessed by including related resource links. As such data should be restricted to records for known or suspected earthquakes.", children: []},
                { name: "Fault Features", description: "The model is from the IUGS CGI interoperability working group. See https://www.seegrid.csiro.au/wiki/bin/view/CGIModel/GeoSciMLThematicView.... This schema is a view of GeoSciML data that denormalizes the data and concatenates complex property values into single, human-readable, labels and returns single, representative, values from controlled vocabularies for multi-valued properties that can be used when generating thematic maps, or portrayals, of the data. It is separate to, but harmonized with, GeoSciML and conforms to the level 0 of the Simple Features Profile for GML (link). Labels will be 'free-text' fields that will be, in robust services, well-structured summaries of complex GeoSciML data, while the representative thematic properties will be URIs of concepts in a controlled vocabulary. There may also be links, via identifier URIs, to full GeoSciML representations of the geologic features.", children: []},
                { name: "Volcanic Vents", description: "This simple content model is intended to identify recently active volcanic vents that may indicate areas of active hydrothermal systems. Detailed geophysical or geodetic information related to active magma movement and prediction of eruptive activity are out of scope.", children: []},
                { name: "Aqueous Chemistry", description: "Basic data characterizing a chemical analysis of an aqueous fluid for the AASG geothermal data project. Typically water temperatures are recorded. A basic content model for sample characterization, location, and analysis metadata is proposed, along with several 'suites' of analytes representing common analysis results. A feature for reporting results for a single analyte is also proposed; use of this approach would separate an analysis using one feature header for each analyte. Mutliple anaytes can be reported under multiple feature headers.", children: []},
                { name: "Thermal Springs", description: "Basic data characterizing a hot spring feature for the AASG geothermal data project. Typically water temperatures are recorded with other information such as water quality or chemical analysis from a particular spring. The temperature and flow rate reported here are meant to be generalized characterization. Other observation services should be used to report time series of temperature or flow measurements; chemical analytical data is also reported by a separate observation service. This sheet may be used to compile multiple temperature or flow rate observations for individual springs as well.", children: []},
                { name: "Borehole Temperature Observations", description: "Temperature measurement data obtained from boreholes for the AASG geothermal data project. Typically bottomhole temperatures are recorded from log headers, and this information will be provided through a borehole temperature observation service. The HeaderURI for a particular borehole (well for simple wells) is the cross-referencing link (foreign key) used to associate the header record, well logs, temperature measurements, and other information from a particular borehole.", children: []},
                { name: "Drill Stem Tests", description: "Drill stem test observation results by the AASG geothermal data project for the National Geothermal Data System.   The HeaderURI for a particular borehole (well for simple wells) is the cross-referencing link (foreign key) used to associate the header record, well logs, temperature measurements, and other information from a particular borehole. At minimum the data will report Observation URI, Well Header URI, Well Name, API No, DST Name, DST Operator, Lat Degree, Long Degree, SRS, DST Target Formation, Depth Top Open Zone, Depth Bottom Open Zone, Pressure Initial Shut In, Pressure Final Shut n, Hydrostatic Pressure, Source, and Information Source.", children: []},
                { name: "Well Headers", description: "A well is a facility defined by its function to extract fluids from within the earth. A well may be a simple hole in the ground (generally not the kind of wells we're interested in here...), but in general will consist of a dug shaft or drilled borehole. Drilled wells may include one or more boreholes (well bores) that are accessed from the surface at an origin collar, which defines the origin of the well. Individual boreholes in the well my have origin points (collars) that are located within existing boreholes in the well (e.g. sidetracks). The most common situation, especially for water wells, is a well consisting of a single borehole with a collar that is coincident with the well origin. Well header features represent individual wells, and are the anchor for a variety of observations and other features.", children: []},
                { name: "Direct Use Features", description: "irect use features describe facilities that utilize geothermal energy directly without transformation to electricity. See the NREL Geothermal Direct Use web page for more information. The template here is based on the Direct Use Site spreadsheet provided by the GeoHeat center at the Oregon Institute of Technology.", children: []},
                { name: "Geologic Contact Features", description: "The model is based on the IUGS CGI interoperability working group. See https://www.seegrid.csiro.au/wiki/bin/view/CGIModel/GeoSciMLThematicView.... This schema is a view of GeoSciML data that denormalizes the data and concatenates complex property values into single, human-readable, labels and returns single, representative values from controlled vocabularies for multi-valued properties that can be used when generating thematic maps, or portrayals, of the data. It is separate to, but harmonized with, GeoSciML and conforms to the level 0 of the Simple Features Profile for GML (link). Labels, will be 'free-text' fields that will be, in robust services, well-structured summaries of complex GeoSciML data, while the representative thematic properties will be URIs of concepts in a controlled vocabulary. There may also be links, via identifier URIs, to full GeoSciML representations of the geologic features.", children: []},
                { name: "Geologic Unit Features", description: "The model is based on the IUGS CGI interoperability working group. See https://www.seegrid.csiro.au/wiki/bin/view/CGIModel/GeoSciMLThematicView.... This schema is a view of GeoSciML data that denormalizes the data and concatenates complex property values into single, human-readable, labels and returns single, representative values from controlled vocabularies for multi-valued properties that can be used when generating thematic maps, or portrayals, of the data. It is separate to, but harmonized with, GeoSciML and conforms to the level 0 of the Simple Features Profile for GML (link). Labels will be 'free-text' fields that will be, in robust services, well-structured summaries of complex GeoSciML data, while the representative thematic properties will be URIs of concepts in a controlled vocabulary. There may also be links, via identifier URIs, to full GeoSciML representations of the geologic features. The geologic unit feature content also conforms closely to the content in the USGS-AASG NCGMP09 database design for a description of map units. These features are essentially geographically located descriptions of outcrop to map scale units of rock--including lithologic composition, age, internal structure (bedding, foliation etc.) and genesis. The content model might be associated with map units on a geologic map, individual polygons (on a map) or borehole intervals (in a stratigraphic log), or with point locations to describe outcrops in field data. For descriptions associated with maps or polygons (outcrop areas), location uncertainty properties are not included.", children: []},
                { name: "Lithology Logs", description: "Lithology log intervals associated with a borehole. Each interval has a top and a bottom, measured from the ground surface (convention for interoperability). Each interval has a geologic unit description that will be identical with the content associated with polygons on a geologic map.", children: []},
                { name: "Heat Flow", description: "Heat Flow measurements. The content model is based on specifications gathered from the SMU Heat Flow database, and has been extended to include the specifics of Heat Flow data from other parties. Minimal required features include Observation URI, Well Name, Header URI, Label, County, State, Latitude and Longitude Degrees, Source, Driller Depth, Interval, Thermal Conductivity, Gradient, Heat Flow, and Heat Flow Method.", children: []}               
            ]
          }     
      ]
    },
    { name: "Resource Accessibility", description: "Datasets categorized in terms of the mechanisms by which they can be accessed, either online or offline.",
      children: [
          { name: "WMS Services", description: "Datasets distributed as Web Mapping Services, as defined by the Open Geospatial Consortium.", children: [] },
          { name: "WFS Services", description: "Datasets distributed as Web Feature Services, as defined by the Open Geospatial Consortium.", children: [] },
          { name: "WCS Services", description: "Datasets distributed as Web Coverage Services, as defined by the Open Geospatial Consortium.", children: [] },
          { name: "ESRI Services", description: "Datasets distributed as Esri Map Services.", children: [] },
          { name: "OPENDaP Services", description: "Datasets distributed as OPENDaP Services.", children: [] },
          { name: "Web Applications", description: "Datasets that are made available through a custom web application.", children: [] },
          { name: "Downloadable Files", description: "Datasets that are available online as a file that can be downloaded.", children: [] },
          { name: "Offline Access", description: "Datasets that are only available offline. Often the mechanism for accessing these documents is to talk to someone in real life.", children: [] },
      ]	
    },
    { name: "Source Organization", description: "Datasets categorized in terms of the organization responsible for providing them.",
      children: [
          { name: "Arizona Geological Survey", description: "", children: [] },
          { name: "Illinois State Geological Survey", description: "", children: [] },
          { name: "Nevada Bureau of Mines and Geology", description: "", children: [] },
          { name: "Kentucky Geological Survey", description: "", children: [] },
      ]	
    }
];