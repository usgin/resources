var cradle = require("cradle"),
	config = require("./config.js"),
	parser = require("xml2json");
	
var metaDb = new (cradle.Connection)(config.dbInfo.dbHost, config.dbInfo.dbPort);
var db = metaDb.database("harvested");

//var atomXml = '<feed xml:lang="en" xmlns="http://www.w3.org/2005/Atom" xmlns:scast="http://sciflo.jpl.nasa.gov/serviceCasting/2009v1"><title>Freeze/Thaw Earth System Data Record Data Visualization</title><subtitle>On freezethaw.ntsg.umt.edu</subtitle><link rel="self" href="http://sciflo.jpl.nasa.gov/scast/NTSG_FreezeThaw_ArcGIS_AJAX.scast.atom"/><updated>2009-02-27T16:18:46.468418</updated><author><name>John Lucotch</name><email>john.lucotch@ntsg.umt.edu</email></author><id>uri:http://measures.ntsg.umt.edu/ArcGIS/rest/services</id><entry><title>Freeze/Thaw Earth System Data Record Data Visualization</title><id>uri:http://measures.ntsg.umt.edu/esdr/</id><updated>2009-02-27T16:18:46.468418</updated><summary>Query yearly freeze/thaw data records    </summary><scast:serviceSemantics>ArcGIS_Server</scast:serviceSemantics><scast:serviceProtocol>AJAX</scast:serviceProtocol><category schema="scast" term="query freeze thaw data records"/><link type="application/rest" title="Server endpoint" href="http://measures.ntsg.umt.edu/esdr/"/><link rel="scast:interfaceDescription" type="application/rest" title="Service interface description" href="http://measures.ntsg.umt.edu/esdr/"/><link rel="scast:serviceEndpoint" type="application/rest" title="Server endpoint" href="http://measures.ntsg.umt.edu/esdr"/><link rel="scast:serviceDocumentation" type="text/html" xml:lang="en-us" title="Service documentation" href="http://freezethaw.ntsg.umt.edu"/><link rel="alternate" type="text/html" xml:lang="en-us" title="Service documentation" href="http://freezethaw.ntsg.umt.edu"/><content type="text"></content></entry></feed>';
//var atomXml = "<feed xmlns='http://www.w3.org/2005/Atom' xmlns:georss='http://www.georss.org/georss' xmlns:scast='http://sciflo.jpl.nasa.gov/serviceCasting/2009v1'><id>http://azgs.az.gov/resources/atom</id><title>AZGS Atom Feed</title><author><name>Arizona Geological Survey</name><email></email></author><updated>2011-10-18T9:54:36.380Z420</updated><entry><title>The title of the resource being described</title><id>5282a88036a15989672b30f7a2000f2b.OTHER</id><author><name>Genhan Chen</name><contactInformation><phone>123-456-7890</phone><email></email><address><street>1234 Somewhere Pl.</street><city>Tucson</city><state>AZ</state><zip>12345</zip></address></contactInformation></author><link href='http://fake.server.com/path/to/your/resource'></link><updated>2011-11-02T18:04:29Z</updated><summary>A description of what the resource being described is about</summary><georss:box>-109 30 -112 45</georss:box></entry><entry><title>The title of the resource being described</title><id>5282a88036a15989672b30f7a2002335.OGC.WMS</id><author><name>Jiangrong Cao</name><contactInformation><phone>123-456-7890</phone><email>jc@fake.com</email><address><street>1234 Desert Glory.</street><city>Tucson</city><state>AZ</state><zip>12345</zip></address></contactInformation></author><author><name>Frank Cao</name><contactInformation><phone>123-456-7890</phone><email>fc@fake.com</email><address><street>1234 Somewhere Pl.</street><city>Tucson</city><state>AZ</state><zip>12345</zip></address></contactInformation></author><scast:serviceSemantics>OGC.WMS</scast:serviceSemantics><scast:serviceProtocol>HTTP</scast:serviceProtocol><link rel='alternate' href='http://jiangrong.com'></link><link rel='scast:interfaceDescription' type='application/xml' href='http://jiangrong.com'></link><updated>2011-11-02T21:16:10Z</updated><summary>A description of what the resource being described is about</summary><georss:box>-109 30 -112 45</georss:box></entry><entry><title>The title of the resource being described</title><id>5282a88036a15989672b30f7a2002335.OTHER</id><author><name>Jiangrong Cao</name><contactInformation><phone>123-456-7890</phone><email>jc@fake.com</email><address><street>1234 Desert Glory.</street><city>Tucson</city><state>AZ</state><zip>12345</zip></address></contactInformation></author><author><name>Frank Cao</name><contactInformation><phone>123-456-7890</phone><email>fc@fake.com</email><address><street>1234 Somewhere Pl.</street><city>Tucson</city><state>AZ</state><zip>12345</zip></address></contactInformation></author><link href='http://testwms.com'></link><updated>2011-11-02T21:16:10Z</updated><summary>A description of what the resource being described is about</summary><georss:box>-109 30 -112 45</georss:box></entry><entry><title>The title of the resource being described</title><id>5282a88036a15989672b30f7a2003132.OGC.WMS</id><author><name>Genhan Chen</name><contactInformation><phone>123-456-7890</phone><email>example@fake.com</email><address><street>1234 Somewhere Pl.</street><city>Tucson</city><state>AZ</state><zip>12345</zip></address></contactInformation></author><scast:serviceSemantics>OGC.WMS</scast:serviceSemantics><scast:serviceProtocol>HTTP</scast:serviceProtocol><link rel='alternate' href='http://OGC/WMS1'></link><link rel='scast:interfaceDescription' type='application/xml' href='http://OGC/WMS1'></link><link href='http://OGC/WMS2'></link><link href='http://OGC/WMS3'></link><updated>2011-11-08T00:40:18Z</updated><summary>A description of what the resource being described is about</summary><georss:box>-109 30 -112 45</georss:box></entry><entry><title>The title of the resource being described</title><id>5282a88036a15989672b30f7a2003132.OGC.WFS</id><author><name>Genhan Chen</name><contactInformation><phone>123-456-7890</phone><email>example@fake.com</email><address><street>1234 Somewhere Pl.</street><city>Tucson</city><state>AZ</state><zip>12345</zip></address></contactInformation></author><scast:serviceSemantics>OGC.WFS</scast:serviceSemantics><scast:serviceProtocol>HTTP</scast:serviceProtocol><link rel='alternate' href='http://OGC/WFS'></link><link rel='scast:interfaceDescription' type='application/xml' href='http://OGC/WFS'></link><updated>2011-11-08T00:40:18Z</updated><summary>A description of what the resource being described is about</summary><georss:box>-109 30 -112 45</georss:box></entry></feed>"
//var atomXml = '<feed xml:lang="en" xmlns="http://www.w3.org/2005/Atom" xmlns:scast="http://sciflo.jpl.nasa.gov/serviceCasting/2009v1"><title>AIRS Near Real Time WMS</title><link rel="self" href="http://g0hep12u.ecs.nasa.gov/airs_nrt_wms.xml"/><updated>2008-10-27T19:33:59.368863</updated><author><name>Christopher Lynnes</name><email>Chris.Lynnes@nasa.gov</email></author><id>uri:http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms</id><entry><title>AIRS Near Real Time WMS</title><id>uri:http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms</id><updated>2008-10-22T19:33:59.368863</updated><summary>AIRS Near Real Time WMS views of BT_diff_SO2 (an indicator of volcanogenic SO2) and RGB images    </summary><scast:serviceSemantics>OGC.WMS</scast:serviceSemantics><scast:serviceProtocol>HTTP</scast:serviceProtocol><category schema="scast" term="AIRS Near-real-time SO2"/><link type="application/xml" title="Server endpoint" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms"/><link rel="scast:serviceInterface" type="application/xml" title="Service interface description" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms?SERVICE=WMS&amp;VERSION=1.1.1&amp;REQUEST=GETCAPABILITIES"/><link rel="scast:serviceEndpoint" type="application/xml" title="Server endpoint" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms"/><link rel="scast:serviceDocumentation" type="text/html" xml:lang="en-us" title="Service documentation" href="http://disc.gsfc.nasa.gov/services/wxs_ogc.shtml"/><link rel="alternate" type="text/html" xml:lang="en-us" title="Service documentation" href="http://disc.gsfc.nasa.gov/services/wxs_ogc.shtml"/><content type="xhtml"><div xmlns="http://www.w3.org/1999/xhtml"><p><b>Example Call (South America, BT_diff_SO2, Descending node)</b></p><p><![CDATA[ http://g0hep12u.ecs.nasa.gov/mapserv-bin/wms_airsnrt?SERVICE=WMS&VERSION=1.0.0&REQUEST=GETMAP&CRS=EPSG:4326&FORMAT=image/png&BBOX=-100,-60,-20,20&WIDTH=512&HEIGHT=512&LAYERS=AIRS_SO2_D,coastline,grid10 ]]></p></div></content></entry></feed>';
var atomXml = '<feed xml:lang="en" xmlns="http://www.w3.org/2005/Atom"><title>AIRS Near Real Time fake services</title><link rel="self" href="http://g0hep12u.ecs.nasa.gov/airs_nrt_wms.xml"/><updated>2008-10-27T19:33:59.368863</updated><author><name>Christopher Lynnes</name><email>Chris.Lynnes@nasa.gov</email></author><id>uri:http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms</id><entry><title>AIRS Near Real Time WMS</title><id>uri:http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms</id><updated>2008-10-22T19:33:59.368863</updated><summary>AIRS Near Real Time WMS views of BT_diff_SO2 (an indicator of volcanogenic SO2) and RGB images    </summary><category schema="scast" term="AIRS Near-real-time SO2"/><link type="application/xml" title="Server endpoint" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms"/><link type="application/xml" title="Service interface description" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms?SERVICE=WMS&amp;VERSION=1.1.1&amp;REQUEST=GETCAPABILITIES"/><link type="application/xml" title="Server endpoint" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wms"/></entry><entry><title>AIRS Near Real Time WFS</title><id>uri:http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wfs</id><updated>2008-10-22T19:33:59.368863</updated><summary>Views of BT_diff_SO2 fake</summary><link type="application/xml" title="Server endpoint" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wfs"/><link type="application/xml" title="Service interface description" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wfs?SERVICE=WFS&amp;VERSION=1.1.1&amp;REQUEST=GETCAPABILITIES"/><link type="application/xml" title="Server endpoint" href="http://g0hep12u.ecs.nasa.gov/mapserv-bin/airsnrt_wfs"/></entry></feed>';
var atomJson = parser.toJson(atomXml);
var objJson = JSON.parse(atomJson);

function objGet(obj, prop, defVal) {
	if(!obj) {
			return defVal;
		}
		propParts = prop.split(".");
		count = 0;
		for(p in propParts) {
			if(obj.hasOwnProperty(propParts[p])) {
				obj = obj[propParts[p]];
				count++;
				if(count === propParts.length) {
					return obj;
				}
			} else {
				return defVal;
			}
		}
};

objFeed = objGet(objJson, "feed", "");
objEntries = objGet(objFeed, "entry", "");

if(objEntries.constructor.toString().indexOf("Array") != -1){
	for(e in objEntries){
		db.save("", objEntries[e], 
			function(err, response){
					if(err){console.log(err);}
				}
		);
	}
}else{
	db.save("", objEntries, 
		function(err, response){
				if(err){console.log(err);}
			}
	);
}

