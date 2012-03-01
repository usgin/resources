# USGIN METADTA MANAGER

A web application for managing metadata. We built it because we wanted good control over the format of the metadata
that we have to manage, we wanted a simple user-interface that doesn't use anything fancier than HTML, Javascript and
CSS, and we also wanted a great way to transform our metadata into whatever standard format we'd like to.

## Installation
### Prerequisites:
1. Node.js and NPM
2. CouchDB and couchdb-lucene
3. Expat and Node dev libraries

### Installation procedure
1. Get the code and install the dependancies:

	    git clone git://github.com/usgin/resources.git
	    cd resources
	    npm install

2. Create a configuration file just for you:

	    cd server/configuration
	    cp config-example.js config
	
3. Adjust the config.js file to suit your purposes.
4. Run the setup routine

	    node setup.js
	
## Run the application
First, make sure that you've got couchdb-lucene running. Then:

	cd resources/server
	node main.js
	
Your application should be available at `http://<your config'd servername>:<you config'd server port>`

