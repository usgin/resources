# USGIN Metadata Manager

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

## Detailed Installation on a blank Ubuntu 11.10 Server
### Update your base install

	sudo apt-get update
	sudo apt-get upgrade
	
### Add the Sun JDK and Node.js Repositories

	sudo add-apt-repository ppa:ferramroberto/java
	sudo add-apt-repository ppa:chris-lea/node.js
	sudo apt-get update
	
If the `add-apt-repository` command doesn't work, you can `sudo apt-get install python-software-properties` first.

### Install packages

	sudo apt-get install git couchdb curl g++ libexpat1-dev nodejs nodejs-dev maven2 sun-java6-jdk unzip curl
	
### Install NPM

	curl http://npmjs.org/install.sh | sudo sh
	
### Get our code and install some dependancies

	git clone git://github.com/usgin/resources.git
	cd resources
	npm install
	
### Setup our application
Follow steps #2-4, as shown above
	
### Install couchdb-lucene

	cd ~
	git clone git://github.com/rnewson/couchdb-lucene.git
	cd ~/couchdb-lucene
	git checkout v0.7.0
	mvn
	
...wait...
If maven fails, perhaps you should `sudo update-alternatives --config java` and select the option for `/usr/lib/jvm/java-6-sun/jre/bin/java`

	cd ~/couchdb-lucene/target
	unzip couchdb-lucene-0.7.0-dist.zip
	
#### Edit the couchdb config file
Whatever text editor you like, maybe `sudo nano /etc/couchdb/local.ini`. Make the following adjustments:
1. Add `os_process_timeout=60000` under the `[couchdb]` heading
2. Add the following to the end of the file:

	[external]
	fti=/usr/bin/python /home/resources/couchdb-lucene/target/couchdb-lucene-0.7.0/tools/couchdb-external-hook.py

	[httpd_db_handlers]
	_fti = {couch_httpd_external, handle_external_req, <<"fti">>}
		
3. Restart couchdb `sudo /etc/init.d/couchdb restart`
Sometimes that doesn't work -- couchdb's package doesn't give the right permissions to some files sometimes.
You might want to `sudo chown couchdb /var/run/couchdb` and `sudo chown couchdb /run/couchdb`, but maybe that's a silly idea.

#### Run couchdb-lucene

	cd ~/couchdb-lucene/target/couchdb-lucene-0.7.0/bin/run &
	
#### Test that couchdb-lucene is working
`curl http://localhost:5984/repository/_fti/_design/indexes/full?q=hibbity` and you should get some JSON back.


